import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_SESSIONS } from '../graphql/queries';
import { ADD_SESSION, DELETE_SESSION } from '../graphql/mutations';
import '../styles/dashboard.css';

interface Session {
  id: string;
  sessionType: string;
  date: string;
  totalDuration: number;
  totalDistance: number;
  weatherTemp: number | null;
  weatherHumidity: number | null;
  weatherWindSpeed: number | null;
  created_at: string;
  updated_at: string;
}

const formatDuration = (totalSeconds: number): string => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const Dashboard: React.FC = () => {
  const { loading, error, data } = useQuery<{ sessions: Session[] }>(GET_SESSIONS);
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
    weatherTemp: '',
    weatherHumidity: '',
    weatherWindSpeed: '',
  });

  const handleSessionTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSessionType(e.target.value);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
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

    console.log("🚀 Submitting session:", {
      sessionType,
      date: formState.date,
      isMultiSport: sessionType === 'Multi-Sport',
      totalDuration: sessionType !== 'Multi-Sport' ? totalDuration : undefined,
      totalDistance: sessionType !== 'Multi-Sport' ? convertedDistance : undefined,
      weatherTemp: formState.weatherTemp ? parseFloat(formState.weatherTemp) : null,
      weatherHumidity: formState.weatherHumidity ? parseInt(formState.weatherHumidity, 10) : null,
      weatherWindSpeed: formState.weatherWindSpeed ? parseFloat(formState.weatherWindSpeed) : null,
    });

    await addSession({
      variables: {
        sessionType,
        date: formState.date,
        isMultiSport: sessionType === 'Multi-Sport',
        totalDuration: sessionType !== 'Multi-Sport' ? totalDuration : undefined,
        totalDistance: sessionType !== 'Multi-Sport' ? convertedDistance : undefined,
        weatherTemp: formState.weatherTemp ? parseFloat(formState.weatherTemp) : null,
        weatherHumidity: formState.weatherHumidity ? parseInt(formState.weatherHumidity, 10) : null,
        weatherWindSpeed: formState.weatherWindSpeed ? parseFloat(formState.weatherWindSpeed) : null,
      },
    });

    setShowForm(false);
    setSessionType('');
    setFormState({ date: '', hours: '0', minutes: '0', seconds: '0', totalDistance: '', weatherTemp: '', weatherHumidity: '', weatherWindSpeed: '' });
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

          <label>Date:</label>
          <input type="date" name="date" value={formState.date} onChange={handleInputChange} required />

          <label>Duration:</label>
          <div className="duration-inputs">
            <input type="number" name="hours" value={formState.hours} onChange={handleInputChange} min="0" required /> Hours
            <input type="number" name="minutes" value={formState.minutes} onChange={handleInputChange} min="0" max="59" required /> Minutes
            <input type="number" name="seconds" value={formState.seconds} onChange={handleInputChange} min="0" max="59" required /> Seconds
          </div>

          <label>Total Distance ({sessionType === 'Swim' ? 'meters' : 'km'}):</label>
          <input type="number" name="totalDistance" value={formState.totalDistance} onChange={handleInputChange} min="0" step="0.1" />

          <label>Weather Temperature (°C):</label>
          <input type="number" name="weatherTemp" value={formState.weatherTemp} onChange={handleInputChange} step="0.1" />

          <label>Weather Humidity (%):</label>
          <input type="number" name="weatherHumidity" value={formState.weatherHumidity} onChange={handleInputChange} />

          <label>Weather Wind Speed (km/h):</label>
          <input type="number" name="weatherWindSpeed" value={formState.weatherWindSpeed} onChange={handleInputChange} step="0.1" />

          <button type="submit">Add Session</button>
        </form>
      )}

      <ul className="session-list">
        {data && data.sessions && data.sessions.length > 0 ? (
          data.sessions.map((session) => (
            <li key={session.id} className="session-item">
              <span>
                <strong>{session.sessionType}</strong> - {formatDuration(session.totalDuration)} - {session.totalDistance} km
              </span>
              <button onClick={() => handleDelete(session.id)}>🗑️</button>
            </li>
          ))
        ) : (
          <p>No sessions found.</p>
        )}
      </ul>
    </div>
  );
};

export default Dashboard;
