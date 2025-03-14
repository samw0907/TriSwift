import React, { useContext } from "react";
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import PersonalRecords from './pages/PersonalRecords';
import PaceCalculator from './pages/PaceCalculator';
import LandingPage from "./pages/LandingPage";
import { AuthContext } from "./context/AuthContext";

const App = () => {
  const auth = useContext(AuthContext);

  if (!auth) return null;

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={auth.isAuthenticated ? <Navigate to="/home" replace /> : <LandingPage />} />
        <Route path="/home" element={auth.isAuthenticated ? <Home /> : <Navigate to="/" />} />
        <Route path="/dashboard" element={auth.isAuthenticated ? <Dashboard /> : <Navigate to="/" />} />
        <Route path="/records" element={auth.isAuthenticated ? <PersonalRecords /> : <Navigate to="/" />} />
        <Route path="/paceCalculator" element={auth.isAuthenticated ? <PaceCalculator /> : <Navigate to="/" />} />
        <Route path="/login" element={auth.isAuthenticated ? <Navigate to="/home" /> : <Login />} />
        <Route path="/signup" element={auth.isAuthenticated ? <Navigate to="/home" /> : <Signup />} />
        <Route path="/landingPage" element={!auth.isAuthenticated ? <LandingPage /> : <Navigate to="/home" />} />
      </Routes>
    </>
  );
};

export default App;
