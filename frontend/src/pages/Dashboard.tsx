import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_WORKOUTS } from '../graphql/queries';
import { ADD_SESSION } from '../graphql/mutations';
import '../styles/dashboard.css';

const Dashboard = () => {
  const { loading, error, data } = useQuery(GET_WORKOUTS);
  const [addSession] = useMutation(ADD_SESSION, {
    refetchQueries: [{ query: GET_WORKOUTS }],
  });

  const [formState, setFormState] = useState({
    sessionType: '',
    date: '',
    totalDuration: 0,
    totalDistance: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addSession({ variables: formState });
    setFormState({ sessionType: '', date: '', totalDuration: 0, totalDistance: 0 });
  };

  if (loading) return <p>Loading sessions...</p>;
  if (error) return <p>Error loading sessions: {error.message}</p>;

  return (
    <div>
      <h1>Session Dashboard</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Session Type"
          value={formState.sessionType}
          onChange={(e) => setFormState({ ...formState, sessionType: e.target.value })}
          required
        />
        <input
          type="date"
          value={formState.date}
          onChange={(e) => setFormState({ ...formState, date: e.target.value })}
          required
        />
        <input
          type="number"
          placeholder="Duration (sec)"
          value={formState.totalDuration}
          onChange={(e) => setFormState({ ...formState, totalDuration: Number(e.target.value) })}
          required
        />
        <input
          type="number"
          placeholder="Distance (km)"
          value={formState.totalDistance}
          onChange={(e) => setFormState({ ...formState, totalDistance: Number(e.target.value) })}
          required
        />
        <button type="submit">Add Session</button>
      </form>

      <ul>
        {data.sessions.map((session: any) => (
          <li key={session.id}>
            <strong>{session.sessionType}</strong> - {session.date} - {session.totalDistance} km
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;
