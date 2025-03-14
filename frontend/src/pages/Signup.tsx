import React, { useState, useCallback } from 'react';
import { useMutation } from '@apollo/client';
import { SIGNUP_USER } from '../graphql/mutations';
import { useNavigate } from 'react-router-dom';
import '../index.css'

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ name: '', email: '', password: '' });
  const [notification, setNotification] = useState<string | null>(null);

  const [signup, { loading, error }] = useMutation(SIGNUP_USER, {
    onCompleted: () => navigate('/login'),
    onError: (error) => {
      console.error("Signup Error:", error);
      if (error.message.includes("Email is already in use")) {
        setNotification("This email is already registered. Try logging in.");
      } else {
        setNotification("Signup failed. Please check your details and try again.");
      }
      setTimeout(() => setNotification(null), 5000);
    }
  });

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signup({ 
        variables: { 
          name: credentials.name.trim(), 
          email: credentials.email.trim().toLowerCase(), 
          password: credentials.password 
        } 
      });
    } catch (error) {
      console.error("Signup Error:", error);
    }
  };

  return (
    <div className="auth-container">
      <h2>Signup</h2>
      {notification && <div className="notification">{notification}</div>}
      <form className="auth-form" onSubmit={handleSubmit}>
        <input type="text" name="name" placeholder="Name" value={credentials.name} onChange={handleChange} required />
        <input type="email" name="email" placeholder="Email" value={credentials.email} onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password" value={credentials.password} onChange={handleChange} required />
        <button type="submit" disabled={loading}>{loading ? "Signing up..." : "Signup"}</button>
      </form>
    </div>
  );
};

export default Signup;
