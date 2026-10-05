const { User } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const register = async (req, res, next) => {
    try {
        const { email, password, role } = req.body;

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) return res.status(400).json({ error: "Пользователь с таким email уже существует" });

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            email,
            passwordHash,
            role: role || 'user' 
        });

        res.status(201).json({ message: "Пользователь успешно зарегистрирован", userId: newUser.id });
    } catch (error) {
        next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user) return res.status(404).json({ error: "Пользователь не найден" });

        if (user.lockUntil && user.lockUntil > new Date()) {
            return res.status(423).json({ error: "Аккаунт временно заблокирован. Попробуйте позже." });
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);

        if (!isMatch) {
            user.failedLoginAttempts += 1;
            
            if (user.failedLoginAttempts >= 5) {
                user.lockUntil = new Date(Date.now() + 5 * 60 * 1000); 
            }
            await user.save();
            return res.status(401).json({ error: "Неверный пароль" });
        }

        user.failedLoginAttempts = 0;
        user.lockUntil = null;

        const accessToken = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );

        const refreshToken = jwt.sign(
            { id: user.id },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: '7d' }
        );

        user.refreshToken = refreshToken;
        await user.save();

        res.status(200).json({ accessToken, refreshToken });
    } catch (error) {
        next(error);
    }
};

const getProfile = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: ['id', 'email', 'role', 'createdAt'] 
        });
        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
};

const refresh = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) return res.status(401).json({ error: "Refresh Token не предоставлен" });

        const user = await User.findOne({ where: { refreshToken } });
        if (!user) return res.status(403).json({ error: "Недействительный Refresh Token" });

        jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, async (err, decoded) => {
            if (err) return res.status(403).json({ error: "Refresh Token истек" });

            const newAccessToken = jwt.sign(
                { id: user.id, email: user.email, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: '15m' }
            );

            const newRefreshToken = jwt.sign(
                { id: user.id },
                process.env.JWT_REFRESH_SECRET,
                { expiresIn: '7d' }
            );

            user.refreshToken = newRefreshToken;
            await user.save();

            res.status(200).json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
        });
    } catch (error) {
        next(error);
    }
};

const logout = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        
        const user = await User.findOne({ where: { refreshToken } });
        if (user) {
            user.refreshToken = null;
            await user.save();
        }

        res.status(200).json({ message: "Вы успешно вышли из системы" });
    } catch (error) {
        next(error);
    }
};

module.exports = { register, login, getProfile, refresh, logout };