import React, { useState, useEffect, useRef } from 'react';
import './chatWindow.css';
import axios from 'axios';
import API_URL from '../config';

const ChatWindow = ({ chatId, onRename, onDelete }) => {
  const [chat, setChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);

  
  useEffect(() => {
    if (!chatId) return;
    setLoading(true);
    const fetchChat = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/chats/${chatId}`, { withCredentials: true });
        if (res.status !== 200) throw new Error(`get chat failed ${res.status}`);
        setChat(res.data);
      } catch (err) {
        console.error('ChatWindow fetchChat error', err);
      } finally {
        setLoading(false);
      }
    };
    fetchChat();
  }, [chatId]);

  useEffect(() => {
    // scroll to bottom when messages change
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chat]);

  const handleSend = async () => {
    if (!message.trim() || isSending) return;
    
    const userMessage = message.trim();
    setMessage('');
    setIsSending(true);
    setError('');

    
    setChat(prev => ({
      ...prev,
      messages: [...prev.messages, { role: 'user', content: userMessage }]
    }));

    try {
      const res = await axios.post(`${API_URL}/api/chats/${chatId}/messages`, {
        message: userMessage
      }, {
        withCredentials: true
      });
      if (res.status !== 200) throw new Error(`send failed ${res.status}`);
      
      setChat(res.data.chat || res.data);
    } catch (err) {
      console.error('ChatWindow handleSend error', err);
      // roll back the optimistic user message so the UI matches the server
      setChat(prev => ({
        ...prev,
        messages: prev.messages.slice(0, -1)
      }));
      setMessage(userMessage);
      setError(err.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleRenameClick = async () => {
    const newTitle = prompt('Enter new title', chat?.title || '');
    if (newTitle && newTitle !== chat.title) {
      try {
        const res = await axios.patch(`${API_URL}/api/chats/${chatId}`, {
          title: newTitle
        }, {
          withCredentials: true
        });
        if (res.status !== 200) throw new Error(`rename failed ${res.status}`);
        setChat(prev => ({ ...prev, title: newTitle }));
        onRename && onRename(chatId, newTitle);
      } catch (err) {
        console.error('ChatWindow rename error', err);
      }
    }
  };

  const handleDeleteClick = async () => {
    if (!window.confirm('Are you sure you want to delete this chat?')) return;
    try {
      const res = await axios.delete(`${API_URL}/api/chats/${chatId}`, {
        withCredentials: true
      });
      if (res.status !== 200) throw new Error(`delete failed ${res.status}`);
      onDelete && onDelete(chatId);
    } catch (err) {
      console.error('ChatWindow delete error', err);
    }
  };

  if (loading) return <div className="chat-loading">Loading chat…</div>;
  if (!chat) return <div className="chat-loading">No chat selected</div>;

  return (
    <div className="chat-window">
      <div className="chat-header">
        <h2>{chat.title || 'Untitled'}</h2>
        <div className="chat-controls">
          <button onClick={handleRenameClick}>✏️</button>
          <button onClick={handleDeleteClick}>🗑️</button>
        </div>
      </div>
      <div className="message-list">
        {chat.messages.map((m, idx) => (
          <div key={idx} className={`message ${m.role}`}> 
            <span>{m.content}</span>
          </div>
        ))}
        {isSending && (
          <div className="typing-indicator">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
        )}
        <div ref={messagesEndRef}></div>
      </div>
      {error && <div className="chat-error">{error}</div>}
      <div className="message-input">
        <input
          type="text"
          value={message}
          onChange={e => setMessage(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
          placeholder={isSending ? "Waiting for response..." : "Type a message..."}
          disabled={isSending}
        />
        <button onClick={handleSend} disabled={isSending || !message.trim()}>
          {isSending ? '…' : <><span className="btn-text">Send</span> ➤</>}
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
