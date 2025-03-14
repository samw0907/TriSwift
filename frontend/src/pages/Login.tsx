import React, { useState, useCallback, useContext } from 'react';
import { useMutation } from '@apollo/client';
import { LOGIN_USER } from '../graphql/mutations';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext'; 
import '../index.css';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);

  if (!authContext) {
    throw new Error("AuthContext must be used within an AuthProvider");
  }

  const { loginUser } = authContext;

  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [notification, setNotification] = useState<string | null>(null);

  const [login, { loading, error }] = useMutation(LOGIN_USER, {
    onCompleted: (data) => {
      if (data?.login?.token) {
        loginUser(data.login.token);
        navigate('/dashboard');
      }
    },
    onError: (error) => {
      console.error("GraphQL Login Error:", error);
      setNotification("Invalid email or password. Please try again.");
      setTimeout(() => setNotification(null), 5000);
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
    <div className="auth-container">
      <h2>Login</h2>
      {notification && <div className="notification">{notification}</div>}
      <form className="auth-form" onSubmit={handleSubmit}>
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
    </div>
  );
};

export default Login;
