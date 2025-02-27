import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { LOGIN_USER } from '../graphql/mutations';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [login, { loading, error }] = useMutation(LOGIN_USER, {
    onCompleted: (data) => {
      console.log("Login Response:", data); // Debugging output
      if (data?.login?.token) {
        localStorage.setItem('token', data.login.token);
        console.log("Token Saved:", localStorage.getItem('token')); // Confirm it's saved
        window.location.reload(); // Force Apollo Client to reload with new token
      }
    },
    onError: (error) => {
      console.error("GraphQL Error:", error);
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting login:", credentials);
    await login({ variables: { email: credentials.email, password: credentials.password } });
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="email" placeholder="Email" onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
        <button type="submit" disabled={loading}>Login</button>
      </form>
      {error && <p style={{ color: 'red' }}>Login failed. Check credentials.</p>}
    </div>
  );
};

export default Login;
