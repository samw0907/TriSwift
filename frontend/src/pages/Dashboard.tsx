import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_SESSIONS } from '../graphql/queries';
import { ADD_SESSION, DELETE_SESSION, ADD_SESSION_ACTIVITY } from '../graphql/mutations';
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

const Dashboard: React.FC = () => {
  const { loading, error, data } = useQuery<{ sessions: Session[] }>(GET_SESSIONS);
  const [addSession] = useMutation(ADD_SESSION, { refetchQueries: [{ query: GET_SESSIONS }] });
  const [addSessionActivity] = useMutation(ADD_SESSION_ACTIVITY, { refetchQueries: [{ query: GET_SESSIONS }] });
  const [deleteSession] = useMutation(DELETE_SESSION, { refetchQueries: [{ query: GET_SESSIONS }] });

  const [step, setStep] = useState(1);
  const [sessionType, setSessionType] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);

  const [sessionForm, setSessionForm] = useState({
    date: '',
    weatherTemp: '',
    weatherHumidity: '',
    weatherWindSpeed: '',
  });

  const [activityForm, setActivityForm] = useState({
    duration: '',
    distance: '',
    heartRateMin: '',
    heartRateMax: '',
    heartRateAvg: '',
    cadence: '',
    power: '',
  });

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this session?')) {
      await deleteSession({ variables: { id } });
    }
  };

  const handleSessionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!sessionType) {
      alert("Please select a session type.");
      return;
    }

    const { data } = await addSession({
      variables: {
        sessionType,
        date: sessionForm.date,
        isMultiSport: sessionType === 'Multi-Sport',
        weatherTemp: sessionForm.weatherTemp ? parseFloat(sessionForm.weatherTemp) : null,
        weatherHumidity: sessionForm.weatherHumidity ? parseInt(sessionForm.weatherHumidity, 10) : null,
        weatherWindSpeed: sessionForm.weatherWindSpeed ? parseFloat(sessionForm.weatherWindSpeed) : null,
      },
    });

    if (data) {
      setSessionId(data.createSession.id);
      if (sessionType === 'Multi-Sport') {
        alert("Multi-Sport sessions coming soon!");
        resetForm();
      } else {
        setStep(2);
      }
    }
  };

  const handleActivitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!sessionId) {
      alert("Session ID is missing. Please create a session first.");
      return;
    }

    await addSessionActivity({
      variables: {
        sessionId,
        sportType: sessionType,
        duration: parseInt(activityForm.duration),
        distance: parseFloat(activityForm.distance),
        heartRateMin: activityForm.heartRateMin ? parseInt(activityForm.heartRateMin) : null,
        heartRateMax: activityForm.heartRateMax ? parseInt(activityForm.heartRateMax) : null,
        heartRateAvg: activityForm.heartRateAvg ? parseInt(activityForm.heartRateAvg) : null,
        cadence: activityForm.cadence ? parseInt(activityForm.cadence) : null,
        power: activityForm.power ? parseInt(activityForm.power) : null,
      },
    });

    resetForm();
  };

  const resetForm = () => {
    setStep(1);
    setSessionType('');
    setSessionId(null);
    setSessionForm({ date: '', weatherTemp: '', weatherHumidity: '', weatherWindSpeed: '' });
    setActivityForm({ duration: '', distance: '', heartRateMin: '', heartRateMax: '', heartRateAvg: '', cadence: '', power: '' });
  };

  return (
    <div className="dashboard">
      <h1>Session Dashboard</h1>

      {step === 1 && (
        <>
          <button onClick={() => setStep(1)}>Add Session</button>
          <form onSubmit={handleSessionSubmit} className="session-form">
            <label>Session Type:</label>
            <select value={sessionType} onChange={(e) => setSessionType(e.target.value)} required>
              <option value="">Select Type</option>
              <option value="Swim">Swim</option>
              <option value="Bike">Bike</option>
              <option value="Run">Run</option>
              <option value="Multi-Sport">Multi-Sport</option>
            </select>

            <label>Date:</label>
            <input type="date" name="date" value={sessionForm.date} onChange={(e) => setSessionForm({ ...sessionForm, date: e.target.value })} required />

            <label>Weather Temperature (°C):</label>
            <input type="number" name="weatherTemp" value={sessionForm.weatherTemp} onChange={(e) => setSessionForm({ ...sessionForm, weatherTemp: e.target.value })} />

            <label>Weather Humidity (%):</label>
            <input type="number" name="weatherHumidity" value={sessionForm.weatherHumidity} onChange={(e) => setSessionForm({ ...sessionForm, weatherHumidity: e.target.value })} />

            <label>Weather Wind Speed (km/h):</label>
            <input type="number" name="weatherWindSpeed" value={sessionForm.weatherWindSpeed} onChange={(e) => setSessionForm({ ...sessionForm, weatherWindSpeed: e.target.value })} />

            <button type="submit">Next</button>
            <button type="button" onClick={resetForm}>Cancel</button>
          </form>
        </>
      )}

      {step === 2 && (
        <>
          <h2>Add Session Activity</h2>
          <form onSubmit={handleActivitySubmit} className="activity-form">
            <label>Duration (seconds):</label>
            <input type="number" name="duration" value={activityForm.duration} onChange={(e) => setActivityForm({ ...activityForm, duration: e.target.value })} required />

            <label>Distance (km):</label>
            <input type="number" name="distance" value={activityForm.distance} onChange={(e) => setActivityForm({ ...activityForm, distance: e.target.value })} required />

            <label>Heart Rate Min:</label>
            <input type="number" name="heartRateMin" value={activityForm.heartRateMin} onChange={(e) => setActivityForm({ ...activityForm, heartRateMin: e.target.value })} />

            <label>Heart Rate Max:</label>
            <input type="number" name="heartRateMax" value={activityForm.heartRateMax} onChange={(e) => setActivityForm({ ...activityForm, heartRateMax: e.target.value })} />

            <label>Heart Rate Avg:</label>
            <input type="number" name="heartRateAvg" value={activityForm.heartRateAvg} onChange={(e) => setActivityForm({ ...activityForm, heartRateAvg: e.target.value })} />

            <label>Cadence:</label>
            <input type="number" name="cadence" value={activityForm.cadence} onChange={(e) => setActivityForm({ ...activityForm, cadence: e.target.value })} />

            <label>Power:</label>
            <input type="number" name="power" value={activityForm.power} onChange={(e) => setActivityForm({ ...activityForm, power: e.target.value })} />

            <button type="submit">Save Activity</button>
            <button type="button" onClick={resetForm}>Cancel</button>
          </form>
        </>
      )}
    </div>
  );
};

export default Dashboard;
