import React, { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import api from '../services/api';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();

  const [error, setError] = useState('');

  if (localStorage.getItem('loggedIn')) {
    
    return <Navigate to="/home" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    try {
      const res = await api.post('/login', { email, password });
      if (res.data.success) {
        localStorage.setItem('loggedIn', '1');
        navigate('/home');
      } else {
        setError(res.data.message || 'Login failed');
      }
    } catch (err) {
      console.error('login error', err);
      const msg = err.response?.data?.detail || err.message || 'Login failed';
      if (msg === 'Network Error') {
        setError(
          'Unable to contact backend. Make sure the server is running at http://localhost:8000'
        );
      } else {
        setError(msg);
      }
    }
  };

  return (
    <div className="container d-flex align-items-center justify-content-center vh-100" style={{ maxWidth: '400px' }}>
      <div className="card shadow-sm">
        <div className="card-body">
          <h2 className="card-title text-center mb-4">Login</h2>
          <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">
            Email address
          </label>
          <input
            type="email"
            className="form-control"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <input
            type="password"
            className="form-control"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <div className="alert alert-danger">{error}</div>}
        <button type="submit" className="btn btn-primary w-100">
          Login
        </button>
        <div className="mt-3 text-center">
          <small>
            Don't have an account? <Link to="/register">Register here</Link>
          </small>
        </div>
      </form>
    </div>
      </div>
    </div>
  );
}

export default Login;