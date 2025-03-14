import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import PersonalRecords from './pages/PersonalRecords';
import PaceCalculator from './pages/PaceCalculator';
import LandingPage from "./pages/LandingPage";

const App = () => {
  const isAuthenticated = !!localStorage.getItem('token'); 
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={isAuthenticated ? <Home /> : <LandingPage />} />
        <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/records" element={isAuthenticated ? <PersonalRecords /> : <Navigate to="/" />} />
        <Route path="/paceCalculator" element={isAuthenticated ? <PaceCalculator /> : <Navigate to="/" />} />
        <Route path="/landingPage" element={<LandingPage />} />
      </Routes>
    </>
  );
};

export default App;
