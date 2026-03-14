import './sidebar.css';
import axios from 'axios';

/**
 * Sidebar component for chat history – typical for chatbot interfaces.
 *
 * Props
 *  - onChatSelect(chatId) called when a chat is clicked (or newly created).
 *  - selectedChatId the id of the chat that is currently active (to highlight).
 */

const Sidebar = ({
  chats,
  loading,
  selectedChatId,
  onChatSelect,
  onNewChat,
  onRename,
  onDelete
}) => {

  const handleNewChat = async () => {
    try{
      const res = await axios.post('/api/chats/', {}, { withCredentials: true });
      // console.log('Sidebar handleNewChat response', res);
      if (res.status !== 201) throw new Error(`new chat failed (${res.status})`);
      const newChat = res.data.chat;
      onNewChat && onNewChat(newChat);
    } catch (err) {
      console.error('Sidebar handleNewChat error', err);
    }
  };

  const handleRename = async(chat) => {
    try{
      const newTitle = prompt('New title', chat.title || '');
      if(!newTitle || newTitle === chat.title) return;
      const chatKey = chat.chatId || chat._id;
      const res = await axios.patch(`/api/chats/${chatKey}`, { title: newTitle }, { withCredentials: true });
      if(res.status !== 200) throw new Error(`rename failed (${res.status})`);
      onRename && onRename(chatKey, newTitle);
    }catch(err){
      console.error('chat rename error', err);
    }
  };

  const handleDelete = async(chat) => {
    try{
      if(!window.confirm('Delete this chat?')) return;
      const chatKey = chat.chatId || chat._id;
      const res = await axios.delete(`/api/chats/${chatKey}`, { withCredentials: true });
      if(res.status !== 200) throw new Error(`delete failed (${res.status})`);
      onDelete && onDelete(chatKey);
    }catch(err){
      console.error('Sidebar delete error', err);
    }
  };

  return (
    <div className="sidebar">
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
                <button onClick={() => handleRename(chat)}>✏️</button>
                <button onClick={() => handleDelete(chat)}>🗑️</button>
              </span>
            </li>
            );
          })}
        </ul>
      )}
    </div>
  );
  
}

export default Sidebar;
