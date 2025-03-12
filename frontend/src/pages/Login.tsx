import React, { useState, useCallback } from 'react';
import { useMutation } from '@apollo/client';
import { LOGIN_USER } from '../graphql/mutations';
import { useNavigate } from 'react-router-dom';
import '../index.css'

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [login, { loading, error }] = useMutation(LOGIN_USER, {
    onCompleted: (data) => {
      if (data?.login?.token) {
        localStorage.setItem('token', data.login.token);
        navigate('/dashboard');
      }
    },
    onError: (error) => {
      console.error("GraphQL Login Error:", error);
    }
  });

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ variables: { email: credentials.email.trim().toLowerCase(), password: credentials.password } });
    } catch (error) {
      console.error("Login Submission Error:", error);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input 
          type="email" 
          name="email" 
          placeholder="Email" 
          value={credentials.email} 
          onChange={handleChange} 
          required 
        />
        <input 
          type="password" 
          name="password" 
          placeholder="Password" 
          value={credentials.password} 
          onChange={handleChange} 
          required 
        />
        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
      {error && (
        <p style={{ color: 'red' }}>
          {error.message.includes("Invalid email or password") 
            ? "Incorrect credentials. Please try again." 
            : "Login failed. Check your connection and try again."}
        </p>
      )}
    </div>
  );
};

export default Login;
