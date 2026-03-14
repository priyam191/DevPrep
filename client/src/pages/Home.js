import React, { useState, useEffect } from 'react';
import Sidebar from '../features/SideBar';
import ChatWindow from '../features/chatWindow';
import axios from 'axios';

const Home = () => {

    const [activeChatId, setActiveChatId] = useState(null);
    const [chats, setChats] = useState([]);
    const [loadingChats, setLoadingChats] = useState(true);

    //load all the chats
    useEffect(() =>{
        const fetchChats = async () => {
            try{
                const response = await axios.get('/api/chats/' , { withCredentials: true });
                if(response.status !== 200) throw new Error(`fetch chats failed (${response.status})`);
                const data = response.data;
                // console.log('Home fetchChats response', data);
                setChats(Array.isArray(data) ? data : data.chats || []);
            }catch(err){
                console.error('Home fetchChats error', err);
            }finally{
                setLoadingChats(false);
            }
        };
        fetchChats();
    }, []);

    const handleNewChat = (chat) => {
        setChats(prev => [chat, ...prev]);
        setActiveChatId(chat.chatId || chat._id);
    };

    const handleRename = (chatId, newTitle) =>{
        setChats(prev => prev.map(c => ((c.chatId === chatId || c._id === chatId) ? { ...c, title: newTitle } : c)));
    };

    const handleDelete = (chatId) => {
        setChats(prev => prev.filter(c => (c.chatId !== chatId && c._id !== chatId)));
        if(activeChatId === chatId){
            setActiveChatId(null);
        }
    };


    return(
        <div className="chat-app">
            <Sidebar
                chats={chats}
                loading={loadingChats}
                selectedChatId={activeChatId}
                onChatSelect={setActiveChatId}
                onNewChat={handleNewChat}
                onRename={handleRename}
                onDelete={handleDelete}
            />

            <div className="chat-panel">
                {activeChatId ? (
                    <ChatWindow
                        chatId={activeChatId}
                        onRename={handleRename}
                        onDelete={handleDelete}
                    />
                ) : (
                    <p>Please start a new chat or select one from the sidebar.</p>
                )}

            </div>
        </div>
    )
};

export default Home;
