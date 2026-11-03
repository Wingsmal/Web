import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import './App.css';

export default function LiveChat({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    socketRef.current = io('http://localhost:3000');

    socketRef.current.on('chat message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socketRef.current.on('system notification', (text) => {
      setMessages((prev) => [...prev, { author: 'СИСТЕМА', text: text, isSystem: true }]);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const msgData = {
      author: user?.email || 'Аноним',
      text: inputValue,
    };

    socketRef.current.emit('chat message', msgData);
    setInputValue('');
  };

  return (
    <div className="chat-widget">
      {isOpen ? (
        <div className="chat-window">
          <div className="chat-header">
            <span> Чат спортсменов</span>
            <button className="btn-icon" onClick={() => setIsOpen(false)} style={{color: 'white'}}>✖</button>
          </div>
          
          <div className="chat-messages">
            {messages.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#9ca3af', marginTop: '20px' }}>В чате пока тихо...</p>
            ) : (
              messages.map((msg, idx) => (
                <div key={idx} className={`chat-message ${msg.isSystem ? 'system' : msg.author === user?.email ? 'mine' : 'other'}`}>
                  {!msg.isSystem && <span className="chat-author">{msg.author}</span>}
                  <div className="chat-bubble">{msg.text}</div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={sendMessage} className="chat-form">
            <input 
              type="text" 
              placeholder="Написать сообщение..." 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <button type="submit">➤</button>
          </form>
        </div>
      ) : (
        <button className="chat-toggle-btn" onClick={() => setIsOpen(true)}>
           Чат
        </button>
      )}
    </div>
  );
}