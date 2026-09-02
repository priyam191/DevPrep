import './sidebar.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({
  chats,
  loading,
  selectedChatId,
  onChatSelect,
  onNewChat,
  onRename,
  onDelete,
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleNewChat = async () => {
    try {
      const res = await axios.post('/api/chats/', {}, { withCredentials: true });
      if (res.status !== 201) throw new Error(`new chat failed (${res.status})`);
      const newChat = res.data.chat;
      onNewChat && onNewChat(newChat);
    } catch (err) {
      console.error('Sidebar handleNewChat error', err);
    }
  };

  const handleRename = async (chat) => {
    try {
      const newTitle = prompt('New title', chat.title || '');
      if (!newTitle || newTitle === chat.title) return;
      const chatKey = chat.chatId || chat._id;
      const res = await axios.patch(`/api/chats/${chatKey}`, { title: newTitle }, { withCredentials: true });
      if (res.status !== 200) throw new Error(`rename failed (${res.status})`);
      onRename && onRename(chatKey, newTitle);
    } catch (err) {
      console.error('chat rename error', err);
    }
  };

  const handleDelete = async (chat) => {
    try {
      if (!window.confirm('Delete this chat?')) return;
      const chatKey = chat.chatId || chat._id;
      const res = await axios.delete(`/api/chats/${chatKey}`, { withCredentials: true });
      if (res.status !== 200) throw new Error(`delete failed (${res.status})`);
      onDelete && onDelete(chatKey);
    } catch (err) {
      console.error('Sidebar delete error', err);
    }
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <span className="sidebar-brand-icon">DP</span>
          DevPrep
        </div>
        <button className="sidebar-close" onClick={onClose} aria-label="Close sidebar">
          ✕
        </button>
      </div>

      <button className="new-chat-button" onClick={handleNewChat}>
        + New Chat
      </button>

      {loading ? (
        <div className="loading">Loading chats…</div>
      ) : (
        <ul className="chat-list">
          {chats.map(chat => {
            const chatKey = chat.chatId || chat._id;
            return (
              <li
                key={chatKey}
                className={chatKey === selectedChatId ? 'selected' : ''}
              >
                <span
                  className="chat-title"
                  onClick={() => onChatSelect && onChatSelect(chatKey)}
                >
                  {chat.title || 'Untitled'}
                </span>
                <span className="chat-actions">
                  <button onClick={() => handleRename(chat)} aria-label="Rename chat">✏️</button>
                  <button onClick={() => handleDelete(chat)} aria-label="Delete chat">🗑️</button>
                </span>
              </li>
            );
          })}
        </ul>
      )}

      <div className="sidebar-footer">
        <button className="sidebar-nav-link" onClick={() => navigate('/dashboard')}>
          🏠 Dashboard
        </button>
        <button className="sidebar-nav-link" onClick={logout}>
          🚪 Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
