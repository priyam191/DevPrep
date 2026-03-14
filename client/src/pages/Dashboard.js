import {useNavigate} from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div>
      <nav className="nav-bar">
        <h1>Dashboard</h1>
        <div className="user-info">
          <span>Welcome, {user?.name}!</span>
          <button onClick={logout} className="logout-btn">Logout</button>
        </div>
      </nav>
      <div className="home-container">
        <div className="content">
          <button onClick={() => navigate('/')} className="button1">ChatBot</button>
          <button onClick={() => {alert('Interview Assistant clicked')}} className="button2">Interview Assistant</button>
        </div>
        <div className="content" style={{ marginTop: '20px' }}>
          <h2>Your Profile</h2>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Account Created:</strong> {new Date(user?.createdAt).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
