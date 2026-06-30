import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api'; // ← Ye import add kar
import '../styles/auth.css';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Purana fetch hata de
      const res = await api.post('/auth/register', {
        name,
        email,
        password
      }, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        }
      });
      
      const data = res.data;
      
      alert('Registration Successful! Please check your email for the Welcome OTP.');
      login(data); // Context me user data save kar
      navigate('/'); // Home pe bhej de
      
    } catch (error) {
      console.error(error);
      // Backend se error message dikha
      alert(error.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>Register</h2>
        <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit" className="btn">Register</button>
        <p>Already have an account? <Link to="/login">Login</Link></p>
      </form>
    </div>
  );
};

export default Register;