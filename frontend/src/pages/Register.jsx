import React, { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import api from '../services/api';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  if (localStorage.getItem('loggedIn')) {
   
    return <Navigate to="/home" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirm) {
      setError('All fields are required');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    try {
      const res = await api.post('/register', { name, email, password });
      if (res.data.success) {
        alert("Registration successful. Please log in.");
        navigate('/login');
      } else {
        setError(res.data.message || 'Registration failed');
      }
    } catch (err) {
      console.error('register error', err);
      
      const msg = err.response?.data?.detail || err.message || 'Registration failed';
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
    <div className="container d-flex align-items-center justify-content-center vh-100" style={{ maxWidth: '500px' }}>
      <div className="card shadow-sm">
        <div className="card-body">
          <h2 className="card-title text-center mb-4">Register</h2>
          <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="name" className="form-label">
            Full Name
          </label>
          <input
            type="text"
            className="form-control"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
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
        <div className="mb-3">
          <label htmlFor="confirm" className="form-label">
            Confirm password
          </label>
          <input
            type="password"
            className="form-control"
            id="confirm"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
        </div>
        {error && <div className="alert alert-danger">{error}</div>}
        <button type="submit" className="btn btn-primary w-100">
          Register
        </button>
        <div className="mt-3 text-center">
          <small>
            Already have an account? <Link to="/login">Login here</Link>
          </small>
        </div>
      </form>
    </div>
      </div>
    </div>
  );
}

export default Register;