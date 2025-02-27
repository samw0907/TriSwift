import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_SESSIONS } from '../graphql/queries';
import { ADD_SESSION } from '../graphql/mutations';
import '../styles/dashboard.css';

const Dashboard = () => {
  const { loading, error, data } = useQuery(GET_SESSIONS);
  const [addSession] = useMutation(ADD_SESSION, {
    refetchQueries: [{ query: GET_SESSIONS }],
  });

  const [formState, setFormState] = useState({
    sessionType: '',
    date: '',
    hours: 0,
    minutes: 0,
    seconds: 0,
    totalDistance: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const totalDuration =
      Number(formState.hours) * 3600 +
      Number(formState.minutes) * 60 +
      Number(formState.seconds);

    await addSession({
      variables: {
        sessionType: formState.sessionType,
        date: formState.date,
        totalDuration: totalDuration,
        totalDistance: formState.totalDistance,
      },
    });

    setFormState({
      sessionType: '',
      date: '',
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalDistance: 0,
    });
  };

  if (loading) return <p>Loading sessions...</p>;
  if (error) return <p>Error loading sessions: {error.message}</p>;

  return (
    <div className="dashboard">
      <h1>Session Dashboard</h1>

      <form onSubmit={handleSubmit} className="session-form">
        <label>Session Type:</label>
        <input
          type="text"
          value={formState.sessionType}
          onChange={(e) => setFormState({ ...formState, sessionType: e.target.value })}
          required
        />

        <label>Date:</label>
        <input
          type="date"
          value={formState.date}
          onChange={(e) => setFormState({ ...formState, date: e.target.value })}
          required
        />

        <label>Duration:</label>
        <div className="duration-inputs">
          <input
            type="number"
            placeholder="Hours"
            value={formState.hours}
            onChange={(e) => setFormState({ ...formState, hours: Number(e.target.value) })}
            min="0"
            required
          />
          <input
            type="number"
            placeholder="Minutes"
            value={formState.minutes}
            onChange={(e) => setFormState({ ...formState, minutes: Number(e.target.value) })}
            min="0"
            max="59"
            required
          />
          <input
            type="number"
            placeholder="Seconds"
            value={formState.seconds}
            onChange={(e) => setFormState({ ...formState, seconds: Number(e.target.value) })}
            min="0"
            max="59"
            required
          />
        </div>

        <label>Total Distance (km):</label>
        <input
          type="number"
          placeholder="Distance (km)"
          value={formState.totalDistance}
          onChange={(e) => setFormState({ ...formState, totalDistance: Number(e.target.value) })}
          required
        />

        <button type="submit">Add Session</button>
      </form>

      <ul className="session-list">
        {data.sessions.map((session: any) => (
          <li key={session.id}>
            <strong>{session.sessionType}</strong> - {session.totalDistance} km
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;
