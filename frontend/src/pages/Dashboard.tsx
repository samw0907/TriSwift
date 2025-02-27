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

  const [formState, setFormState] = useState({
    sessionType: '',
    date: '',
    hours: '',
    minutes: '',
    seconds: '',
    totalDistance: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const totalDuration =
      Number(formState.hours || 0) * 3600 +
      Number(formState.minutes || 0) * 60 +
      Number(formState.seconds || 0);

    await addSession({
      variables: {
        sessionType: formState.sessionType,
        date: formState.date,
        totalDuration: totalDuration,
        totalDistance: formState.totalDistance ? Number(formState.totalDistance) : 0,
      },
    });

    setFormState({
      sessionType: '',
      date: '',
      hours: '',
      minutes: '',
      seconds: '',
      totalDistance: '',
    });
  };

  if (loading) return <p>Loading sessions...</p>;
  if (error) return <p>Error loading sessions: {error.message}</p>;

  return (
    <div className="dashboard">
      <h1>Session Dashboard</h1>

      <form onSubmit={handleSubmit} className="session-form">
        <div className="row">
          <div className="input-box">
            <label>Session Type:</label>
            <select
              value={formState.sessionType}
              onChange={(e) => setFormState({ ...formState, sessionType: e.target.value })}
              required
            >
              <option value="">Select Type</option>
              <option value="Multi-Sport">Multi-Sport</option>
              <option value="Swim">Swim</option>
              <option value="Bike">Bike</option>
              <option value="Run">Run</option>
            </select>
          </div>

          <div className="input-box">
            <label>Date:</label>
            <input
              type="date"
              value={formState.date}
              onChange={(e) => setFormState({ ...formState, date: e.target.value })}
              required
            />
          </div>
        </div>

        <label>Duration:</label>
        <div className="duration-inputs">
          <div className="duration-box">
            <input
              type="number"
              placeholder="0"
              value={formState.hours}
              onChange={(e) => setFormState({ ...formState, hours: e.target.value })}
              min="0"
              required
            />
            <span>Hours</span>
          </div>
          <div className="duration-box">
            <input
              type="number"
              placeholder="0"
              value={formState.minutes}
              onChange={(e) => setFormState({ ...formState, minutes: e.target.value })}
              min="0"
              max="59"
              required
            />
            <span>Minutes</span>
          </div>
          <div className="duration-box">
            <input
              type="number"
              placeholder="0"
              value={formState.seconds}
              onChange={(e) => setFormState({ ...formState, seconds: e.target.value })}
              min="0"
              max="59"
              required
            />
            <span>Seconds</span>
          </div>
        </div>

        <label>Total Distance (km):</label>
        <input
          type="number"
          placeholder="Enter distance"
          value={formState.totalDistance}
          onChange={(e) => setFormState({ ...formState, totalDistance: e.target.value })}
        />

        <button type="submit">Add Session</button>
      </form>

      <ul className="session-list">
        {data.sessions.map((session: any) => (
          <li key={session.id}>
            <strong>{session.sessionType}</strong> - {formatDuration(session.totalDuration)} - {session.totalDistance} km
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;
