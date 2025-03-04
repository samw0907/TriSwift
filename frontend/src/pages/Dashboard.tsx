import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_SESSIONS } from '../graphql/queries';
import { ADD_SESSION, DELETE_SESSION, ADD_SESSION_ACTIVITY } from '../graphql/mutations';
import '../styles/dashboard.css';

interface Session {
  id: string;
  session_type: string;
  date: string;
  total_duration: number | null;
  total_distance: number | null;
  weather_temp?: number | null;
  weather_humidity?: number | null;
  weather_wind_speed?: number | null;
  activities: Activity[];
  created_at: string;
  updated_at: string;
}

interface Activity {
  id: string;
  sport_type: string;
  duration: number;
  distance: number;
  heart_rate_min?: number;
  heart_rate_max?: number;
  heart_rate_avg?: number;
  cadence?: number;
  power?: number;
}

const Dashboard: React.FC = () => {
  const { loading, error, data } = useQuery<{ sessions: Session[] }>(GET_SESSIONS);
  const [addSession] = useMutation(ADD_SESSION, { refetchQueries: [{ query: GET_SESSIONS }] });
  const [addSessionActivity] = useMutation(ADD_SESSION_ACTIVITY, { refetchQueries: [{ query: GET_SESSIONS }] });
  const [deleteSession] = useMutation(DELETE_SESSION, { refetchQueries: [{ query: GET_SESSIONS }] });

  const [showSessionForm, setShowSessionForm] = useState(false);
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
  const [session_type, setSessionType] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);

  const [sessionForm, setSessionForm] = useState({
    date: '',
    weather_temp: '',
    weather_humidity: '',
    weather_wind_speed: '',
  });

  const [activityForm, setActivityForm] = useState({
    hours: '',
    minutes: '',
    seconds: '',
    distance: '',
    heart_rate_min: '',
    heart_rate_max: '',
    heart_rate_avg: '',
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
  
    if (!session_type) {
      alert("Please select a session type.");
      return;
    }
  
    try {
      const { data } = await addSession({
        variables: {
          sessionType: session_type, // ✅ GraphQL expects camelCase
          date: sessionForm.date,
          isMultiSport: session_type === 'Multi-Sport', // ✅ GraphQL expects camelCase
          totalDuration: 0, // Defaults to 0
          totalDistance: 0,
          weatherTemp: sessionForm.weather_temp ? parseFloat(sessionForm.weather_temp) : null,
          weatherHumidity: sessionForm.weather_humidity ? parseInt(sessionForm.weather_humidity) : null,
          weatherWindSpeed: sessionForm.weather_wind_speed ? parseFloat(sessionForm.weather_wind_speed) : null,
        },
      });
  
      if (data) {
        setSessionId(data.createSession.id);
        setShowSessionForm(false);
        setShowActivityForm(true);
      }
    } catch (error) {
      console.error("❌ Error Creating Session:", error);
      alert("Failed to create session. Please try again.");
    }
  };
  

  const handleActivitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!sessionId) {
      alert("Session ID is missing. Please create a session first.");
      return;
    }

    const durationInSeconds =
      (parseInt(activityForm.hours) || 0) * 3600 +
      (parseInt(activityForm.minutes) || 0) * 60 +
      (parseInt(activityForm.seconds) || 0);

    if (!activityForm.distance) {
      alert("Distance is required.");
      return;
    }

    try {
      await addSessionActivity({
        variables: {
          session_id: sessionId,
          sport_type: session_type,
          duration: durationInSeconds,
          distance: parseFloat(activityForm.distance),
          heart_rate_min: activityForm.heart_rate_min ? parseInt(activityForm.heart_rate_min) : null,
          heart_rate_max: activityForm.heart_rate_max ? parseInt(activityForm.heart_rate_max) : null,
          heart_rate_avg: activityForm.heart_rate_avg ? parseInt(activityForm.heart_rate_avg) : null,
          cadence: activityForm.cadence ? parseInt(activityForm.cadence) : null,
          power: activityForm.power ? parseInt(activityForm.power) : null,
        },
      });

      resetForms();
    } catch (error) {
      console.error("❌ Error Creating Activity:", error);
      alert("Failed to create activity. Please try again.");
    }
  };

  const resetForms = () => {
    setShowSessionForm(false);
    setShowActivityForm(false);
    setSessionType('');
    setSessionId(null);
    setSessionForm({ date: '', weather_temp: '', weather_humidity: '', weather_wind_speed: '' });
    setActivityForm({ hours: '', minutes: '', seconds: '', distance: '', heart_rate_min: '', heart_rate_max: '', heart_rate_avg: '', cadence: '', power: '' });
  };

  return (
    <div className="dashboard">
      <h1>Session Dashboard</h1>
      {!showSessionForm && !showActivityForm && <button onClick={() => setShowSessionForm(true)}>Add Session</button>}

      {showSessionForm && (
        <form onSubmit={handleSessionSubmit} className="session-form">
          <label>Session Type:</label>
          <select value={session_type} onChange={(e) => setSessionType(e.target.value)} required>
            <option value="">Select Type</option>
            <option value="Swim">Swim</option>
            <option value="Bike">Bike</option>
            <option value="Run">Run</option>
            <option value="Multi-Sport">Multi-Sport</option>
          </select>

          <label>Date:</label>
          <input type="date" name="date" value={sessionForm.date} onChange={(e) => setSessionForm({ ...sessionForm, date: e.target.value })} required />

          <label>Weather Temp (°C):</label>
          <input type="number" name="weather_temp" value={sessionForm.weather_temp} onChange={(e) => setSessionForm({ ...sessionForm, weather_temp: e.target.value })} />

          <label>Weather Humidity (%):</label>
          <input type="number" name="weather_humidity" value={sessionForm.weather_humidity} onChange={(e) => setSessionForm({ ...sessionForm, weather_humidity: e.target.value })} />

          <label>Wind Speed (m/s):</label>
          <input type="number" name="weather_wind_speed" value={sessionForm.weather_wind_speed} onChange={(e) => setSessionForm({ ...sessionForm, weather_wind_speed: e.target.value })} />

          <button type="submit">Next</button>
          <button type="button" onClick={resetForms}>Cancel</button>
        </form>
      )}
    </div>
  );
};

export default Dashboard;
