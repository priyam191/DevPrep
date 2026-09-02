import React, { useState, useEffect } from 'react';
import Sidebar from '../features/SideBar';
import ChatWindow from '../features/chatWindow';
import axios from 'axios';

const Home = () => {
    const [activeChatId, setActiveChatId] = useState(null);
    const [chats, setChats] = useState([]);
    const [loadingChats, setLoadingChats] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        const fetchChats = async () => {
            try {
                const response = await axios.get('/api/chats/', { withCredentials: true });
                if (response.status !== 200) throw new Error(`fetch chats failed (${response.status})`);
                const data = response.data;
                setChats(Array.isArray(data) ? data : data.chats || []);
            } catch (err) {
                console.error('Home fetchChats error', err);
            } finally {
                setLoadingChats(false);
            }
        };
        fetchChats();
    }, []);

    const handleNewChat = (chat) => {
        setChats(prev => [chat, ...prev]);
        setActiveChatId(chat.chatId || chat._id);
        setSidebarOpen(false);
    };

    const handleChatSelect = (chatId) => {
        setActiveChatId(chatId);
        setSidebarOpen(false);
    };

    const handleRename = (chatId, newTitle) => {
        setChats(prev => prev.map(c => ((c.chatId === chatId || c._id === chatId) ? { ...c, title: newTitle } : c)));
    };

    const handleDelete = (chatId) => {
        setChats(prev => prev.filter(c => (c.chatId !== chatId && c._id !== chatId)));
        if (activeChatId === chatId) {
            setActiveChatId(null);
        }
    };

    const activeChat = chats.find(c => (c.chatId || c._id) === activeChatId);

    return (
        <div className="chat-app">
            <div
                className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''}`}
                onClick={() => setSidebarOpen(false)}
                aria-hidden="true"
            />

            <Sidebar
                chats={chats}
                loading={loadingChats}
                selectedChatId={activeChatId}
                onChatSelect={handleChatSelect}
                onNewChat={handleNewChat}
                onRename={handleRename}
                onDelete={handleDelete}
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <div className="chat-main">
                <header className="chat-mobile-header">
                    <button
                        className="menu-toggle"
                        onClick={() => setSidebarOpen(true)}
                        aria-label="Open sidebar"
                    >
                        ☰
                    </button>
                    <h1>{activeChat?.title || 'DevPrep Chat'}</h1>
                </header>

                <div className="chat-panel">
                    {activeChatId ? (
                        <ChatWindow
                            chatId={activeChatId}
                            onRename={handleRename}
                            onDelete={handleDelete}
                        />
                    ) : (
                        <div className="chat-empty">
                            <div className="chat-empty-icon">💬</div>
                            <h2>Start a conversation</h2>
                            <p>Select an existing chat from the sidebar or create a new one to get started.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Home;
