import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="dashboard-page">
      <nav className="nav-bar">
        <div className="brand">
          <span className="brand-icon">DP</span>
          <h1>DevPrep</h1>
        </div>
        <div className="user-info">
          <span>Welcome, {user?.name}!</span>
          <button onClick={logout} className="logout-btn">Logout</button>
        </div>
      </nav>

      <div className="dashboard-container">
        <div className="dashboard-welcome">
          <h2>Welcome back, {user?.name?.split(' ')[0]}!</h2>
          <p>Choose a tool below to continue your preparation.</p>
        </div>

        <div className="dashboard-grid">
          <button className="feature-card" onClick={() => navigate('/')}>
            <div className="feature-card-icon chat">💬</div>
            <h3>ChatBot</h3>
            <p>Practice technical questions and get instant AI-powered feedback on your answers.</p>
          </button>

          <button
            className="feature-card"
            onClick={() => alert('Interview Assistant coming soon!')}
          >
            <div className="feature-card-icon interview">🎯</div>
            <h3>Interview Assistant</h3>
            <p>Simulate real interview scenarios and improve your communication skills.</p>
          </button>

          <div className="profile-card">
            <h3>Your Profile</h3>
            <div className="profile-details">
              <div className="profile-row">
                <span className="profile-label">Name</span>
                <span className="profile-value">{user?.name}</span>
              </div>
              <div className="profile-row">
                <span className="profile-label">Email</span>
                <span className="profile-value">{user?.email}</span>
              </div>
              <div className="profile-row">
                <span className="profile-label">Account Created</span>
                <span className="profile-value">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  }) : '—'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
