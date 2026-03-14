import React, { useState, useEffect, useRef } from 'react';
import './chatWindow.css';
import axios from 'axios';

const ChatWindow = ({ chatId, onRename, onDelete }) => {
  const [chat, setChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);

  // fetch chat whenever id changes
  useEffect(() => {
    if (!chatId) return;
    setLoading(true);
    const fetchChat = async () => {
      try {
        const res = await axios.get(`/api/chats/${chatId}`, { withCredentials: true });
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
    if (!message.trim()) return;
    try {
      const res = await axios.post(`/api/chats/${chatId}/messages`, {
        message
      }, {
        withCredentials: true
      });
      if (res.status !== 200) throw new Error(`send failed ${res.status}`);
      // controller returns updated chat
      setChat(res.data.chat || res.data);
      setMessage('');
    } catch (err) {
      console.error('ChatWindow handleSend error', err);
    }
  };

  const handleRenameClick = async () => {
    const newTitle = prompt('Enter new title', chat?.title || '');
    if (newTitle && newTitle !== chat.title) {
      try {
        const res = await axios.patch(`/api/chats/${chatId}`, {
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
      const res = await axios.delete(`/api/chats/${chatId}`, {
        withCredentials: true
      });
      if (res.status !== 200) throw new Error(`delete failed ${res.status}`);
      onDelete && onDelete(chatId);
    } catch (err) {
      console.error('ChatWindow delete error', err);
    }
  };

  if (loading) return <div>Loading chat…</div>;
  if (!chat) return <div>No chat selected</div>;

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
        <div ref={messagesEndRef}></div>
      </div>
      <div className="message-input">
        <input
          type="text"
          value={message}
          onChange={e => setMessage(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
          placeholder="Type a message…"
        />
        <button onClick={handleSend}>{loading ? 'Loading…' : 'Send'}</button>
      </div>
    </div>
  );
};

export default ChatWindow;
