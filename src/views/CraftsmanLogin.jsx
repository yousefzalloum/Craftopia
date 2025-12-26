import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';

const CraftsmanLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Demo craftsman credentials
    const demoCraftsmen = [
      { email: 'ahmad.hassan@craftopia.com', password: 'craftsman123', id: 1, name: 'Ahmad Hassan' },
      { email: 'sarah.mitchell@craftopia.com', password: 'craftsman123', id: 2, name: 'Sarah Mitchell' },
      { email: 'james.wilson@craftopia.com', password: 'craftsman123', id: 3, name: 'James Wilson' }
    ];

    const craftsman = demoCraftsmen.find(
      c => c.email === formData.email && c.password === formData.password
    );

    if (craftsman) {
      // Store craftsman session
      localStorage.setItem('craftopia_craftsman', JSON.stringify({
        id: craftsman.id,
        name: craftsman.name,
        email: craftsman.email,
        type: 'craftsman'
      }));
      
      // Redirect to craftsman dashboard
      navigate('/craftsman-dashboard');
    } else {
      setError('Invalid email or password. Use craftsman credentials.');
    }
  };

  const handleDemoLogin = () => {
    const demoCraftsman = {
      id: 1,
      name: 'Ahmad Hassan',
      email: 'ahmad.hassan@craftopia.com',
      type: 'craftsman'
    };
    
    localStorage.setItem('craftopia_craftsman', JSON.stringify(demoCraftsman));
    navigate('/craftsman-dashboard');
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h1>🔨 Craftsman Portal</h1>
            <p>Login to manage your business</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your.email@craftopia.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="btn-submit">
              Login as Craftsman
            </button>

            <button 
              type="button" 
              className="btn-demo"
              onClick={handleDemoLogin}
            >
              Use Demo Craftsman Account
            </button>
          </form>

          <div className="login-footer">
            <p>Are you a customer? <a href="/login">Customer Login</a></p>
            <div className="demo-credentials">
              <p><strong>Demo Credentials:</strong></p>
              <p>Email: ahmad.hassan@craftopia.com</p>
              <p>Password: craftsman123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CraftsmanLogin;
