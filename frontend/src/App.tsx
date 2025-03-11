import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import PersonalRecords from './pages/PersonalRecords';
import PaceCalculator from './pages/PaceCalculator';

const App = () => {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/records" element={<PersonalRecords />} />
        <Route path="/paceCalculator" element={<PaceCalculator />} />
      </Routes>
    </>
  );
};

export default App;
