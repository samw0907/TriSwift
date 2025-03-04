import React, { useState, useCallback } from 'react';
import { useMutation } from '@apollo/client';
import { SIGNUP_USER } from '../graphql/mutations';
import { useNavigate } from 'react-router-dom';

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ name: '', email: '', password: '' });
  const [signup, { loading, error }] = useMutation(SIGNUP_USER, {
    onCompleted: () => navigate('/login'),
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
    <div>
      <h2>Signup</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="name" placeholder="Name" value={credentials.name} onChange={handleChange} required />
        <input type="email" name="email" placeholder="Email" value={credentials.email} onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password" value={credentials.password} onChange={handleChange} required />
        <button type="submit" disabled={loading}>{loading ? "Signing up..." : "Signup"}</button>
      </form>
      {error && (
        <p style={{ color: 'red' }}>
          {error.message.includes("Email is already in use") 
            ? "This email is already registered. Try logging in."
            : "Signup failed. Please check your details and try again."}
        </p>
      )}
    </div>
  );
};

export default Signup;
