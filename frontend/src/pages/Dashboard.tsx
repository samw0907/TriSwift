import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_SESSIONS } from '../graphql/queries';
import { ADD_SESSION, DELETE_SESSION } from '../graphql/mutations';
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

  const [deleteSession] = useMutation(DELETE_SESSION, {
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

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this session?')) {
      await deleteSession({ variables: { id } });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const totalDuration =
      (Number(formState.hours) || 0) * 3600 +
      (Number(formState.minutes) || 0) * 60 +
      (Number(formState.seconds) || 0);

    const convertedDistance = sessionType === 'Swim'
      ? Number(formState.totalDistance) / 1000
      : Number(formState.totalDistance);

    await addSession({
      variables: {
        session_type: sessionType,
        date: formState.date,
        total_duration: totalDuration,
        total_distance: convertedDistance,
      },
    });

    setShowForm(false);
    setSessionType('');
    setFormState({ date: '', hours: '0', minutes: '0', seconds: '0', totalDistance: '' });
  };

  if (loading) return <p>Loading sessions...</p>;
  if (error) return <p>Error loading sessions: {error.message}</p>;

  return (
    <div className="dashboard">
      <h1>Session Dashboard</h1>
      {!showForm && <button onClick={() => setShowForm(true)}>Add Session</button>}

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
                  <input type="number" name="hours" value={formState.hours} onChange={handleInputChange} min="0" required />
                  <span>Hours</span>
                </div>
                <div className="duration-box">
                  <input type="number" name="minutes" value={formState.minutes} onChange={handleInputChange} min="0" max="59" required />
                  <span>Minutes</span>
                </div>
                <div className="duration-box">
                  <input type="number" name="seconds" value={formState.seconds} onChange={handleInputChange} min="0" max="59" required />
                  <span>Seconds</span>
                </div>
              </div>

              <label>Total Distance ({sessionType === 'Swim' ? 'meters' : 'km'}):</label>
              <input
                type="number"
                name="totalDistance"
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
        {data.sessions.map((session: any) => {
          const displayedDistance = session.session_type === 'Swim'
            ? session.total_distance * 1000
            : session.total_distance;

          return (
            <li key={session.id} className="session-item">
              <span>
                <strong>{session.session_type}</strong> - {formatDuration(session.total_duration)} - {displayedDistance} {session.session_type === 'Swim' ? 'm' : 'km'}
              </span>
              <button
                onClick={() => handleDelete(session.id)}
                className="text-red-500 hover:text-red-700 transition-colors duration-200"
              >
                🗑️
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Dashboard;
