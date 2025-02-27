import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_SESSIONS } from '../graphql/queries';
import { ADD_SESSION } from '../graphql/mutations';
import '../styles/dashboard.css';

const formatDuration = (totalSeconds: number) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const Dashboard = () => {
  const { loading, error, data } = useQuery(GET_SESSIONS);
  const [addSession] = useMutation(ADD_SESSION, {
    refetchQueries: [{ query: GET_SESSIONS }],
  });

  const [showForm, setShowForm] = useState(false);
  const [sessionType, setSessionType] = useState('');
  const [formState, setFormState] = useState({
    date: '',
    hours: '0',
    minutes: '0',
    seconds: '0',
    totalDistance: '',
  });

  const handleSessionTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSessionType(e.target.value);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
  
    if (name === 'hours' || name === 'minutes' || name === 'seconds') {
      setFormState((prev) => ({
        ...prev,
        [name]: value === '' ? '0' : String(Math.max(0, Number(value))),
      }));
    } else {
      setFormState((prev) => ({ ...prev, [name]: value }));
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const totalDuration =
      (Number(formState.hours) || 0) * 3600 +
      (Number(formState.minutes) || 0) * 60 +
      (Number(formState.seconds) || 0);
    
    await addSession({
      variables: {
        sessionType,
        date: formState.date,
        totalDuration,
        totalDistance: formState.totalDistance ? Number(formState.totalDistance) : 0,
      },
    });

    setShowForm(false);
    setSessionType('');
    setFormState({ date: '', hours: '', minutes: '', seconds: '', totalDistance: '' });
  };

  if (loading) return <p>Loading sessions...</p>;
  if (error) return <p>Error loading sessions: {error.message}</p>;

  return (
    <div className="dashboard">
      <h1>Session Dashboard</h1>
      {!showForm && (
        <button onClick={() => setShowForm(true)}>Add Session</button>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="session-form">
          <label>Session Type:</label>
          <select value={sessionType} onChange={handleSessionTypeChange} required>
            <option value="">Select Type</option>
            <option value="Multi-Sport">Multi-Sport</option>
            <option value="Swim">Swim</option>
            <option value="Bike">Bike</option>
            <option value="Run">Run</option>
          </select>

          {sessionType === 'Multi-Sport' && <p>Feature coming soon!</p>}
          {sessionType && sessionType !== 'Multi-Sport' && (
            <>
              <label>Date:</label>
              <input type="date" name="date" value={formState.date} onChange={handleInputChange} required />
              
              <label>Duration:</label>
              <div className="duration-inputs">
                <div className="duration-box">
                  <input type="number" name="hours" placeholder="0" value={formState.hours} onChange={handleInputChange} min="0" required />
                  <span>Hours</span>
                </div>
                <div className="duration-box">
                  <input type="number" name="minutes" placeholder="0" value={formState.minutes} onChange={handleInputChange} min="0" max="59" required />
                  <span>Minutes</span>
                </div>
                <div className="duration-box">
                  <input type="number" name="seconds" placeholder="0" value={formState.seconds} onChange={handleInputChange} min="0" max="59" required />
                  <span>Seconds</span>
                </div>
              </div>

              <label>Total Distance ({sessionType === 'Swim' ? 'meters' : 'km'}):</label>
              <input
                type="number"
                name="totalDistance"
                placeholder="Enter distance"
                value={formState.totalDistance}
                onChange={handleInputChange}
                min="0"
                step="0.1"
              />

              <button type="submit">Add Session</button>
            </>
          )}
        </form>
      )}

      <ul className="session-list">
        {data.sessions.map((session: any) => (
          <li key={session.id}>
            <strong>{session.sessionType}</strong> - {formatDuration(session.totalDuration)} - {session.totalDistance} {session.sessionType === 'Swim' ? 'm' : 'km'}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;
