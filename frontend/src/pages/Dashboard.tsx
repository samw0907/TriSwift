import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_SESSIONS } from '../graphql/queries';
import { ADD_SESSION, DELETE_SESSION, ADD_SESSION_ACTIVITY } from '../graphql/mutations';
import '../styles/dashboard.css';

interface Session {
  id: string;
  sessionType: string;
  date: string;
  totalDuration: number | null;
  totalDistance: number | null;
  weatherTemp?: number | null;
  weatherHumidity?: number | null;
  weatherWindSpeed?: number | null;
  activities: Activity[];
  created_at: string;
  updated_at: string;
}

interface Activity {
  id: string;
  sportType: string;
  duration: number;
  distance: number;
  heartRateMin?: number;
  heartRateMax?: number;
  heartRateAvg?: number;
  cadence?: number;
  power?: number;
}

const Dashboard: React.FC = () => {
  const { loading, error, data, refetch } = useQuery<{ sessions: Session[] }>(GET_SESSIONS);
  const [addSession] = useMutation(ADD_SESSION, { refetchQueries: [{ query: GET_SESSIONS }] });
  const [addSessionActivity] = useMutation(ADD_SESSION_ACTIVITY, { refetchQueries: [{ query: GET_SESSIONS }] });
  const [deleteSession] = useMutation(DELETE_SESSION, { refetchQueries: [{ query: GET_SESSIONS }] });

  const [showSessionForm, setShowSessionForm] = useState(false);
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
  const [sessionType, setSessionType] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    if (data?.sessions) {
      setSessions(data.sessions);
    }
  }, [data]);

  const [sessionForm, setSessionForm] = useState({
    date: '',
    weatherTemp: '',
    weatherHumidity: '',
    weatherWindSpeed: '',
  });

  const [activityForm, setActivityForm] = useState({
    hours: '',
    minutes: '',
    seconds: '',
    distance: '',
    heartRateMin: '',
    heartRateMax: '',
    heartRateAvg: '',
    cadence: '',
    power: '',
  });

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this session?')) {
      setSessions((prevSessions) => prevSessions.filter((session) => session.id !== id));

      try {
        await deleteSession({ variables: { id } });
        refetch();
      } catch (error) {
        console.error("❌ Error Deleting Session:", error);
        alert("Failed to delete session. Please try again.");
      }
    }
  };

  const handleSessionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!sessionType) {
      alert("Please select a session type.");
      return;
    }

    try {
      const { data } = await addSession({
        variables: {
          sessionType,
          date: sessionForm.date,
          isMultiSport: sessionType === 'Multi-Sport',
          totalDuration: 0,
          totalDistance: 0,
          weatherTemp: sessionForm.weatherTemp ? parseFloat(sessionForm.weatherTemp) : null,
          weatherHumidity: sessionForm.weatherHumidity ? parseInt(sessionForm.weatherHumidity) : null,
          weatherWindSpeed: sessionForm.weatherWindSpeed ? parseFloat(sessionForm.weatherWindSpeed) : null,
        },
      });

      if (data?.createSession) {
        setSessions((prevSessions) => [...prevSessions, data.createSession]);
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
          sessionId,
          sportType: sessionType,
          duration: durationInSeconds,
          distance: parseFloat(activityForm.distance),
          heartRateMin: activityForm.heartRateMin ? parseInt(activityForm.heartRateMin) : null,
          heartRateMax: activityForm.heartRateMax ? parseInt(activityForm.heartRateMax) : null,
          heartRateAvg: activityForm.heartRateAvg ? parseInt(activityForm.heartRateAvg) : null,
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
    setSessionForm({ date: '', weatherTemp: '', weatherHumidity: '', weatherWindSpeed: '' });
    setActivityForm({ hours: '', minutes: '', seconds: '', distance: '', heartRateMin: '', heartRateMax: '', heartRateAvg: '', cadence: '', power: '' });
  };

  return (
    <div className="dashboard">
      <h1>Session Dashboard</h1>

      {!showSessionForm && !showActivityForm && (
        <button onClick={() => setShowSessionForm(true)}>Add Session</button>
      )}

      {showSessionForm && (
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

          <button type="submit">Next</button>
          <button type="button" onClick={() => setShowSessionForm(false)}>Cancel</button>
        </form>
      )}

      <h2>Past Sessions</h2>
      {loading && <p>Loading sessions...</p>}
      {error && <p style={{ color: 'red' }}>Error fetching sessions</p>}
      {sessions.length === 0 && <p>No sessions available.</p>}

      <ul>
        {sessions.map((session) => (
          <li key={session.id}>
            <strong>{session.sessionType}</strong> {new Date(session.date).toLocaleDateString()}
            <br />
            <button onClick={() => setExpandedSessionId(expandedSessionId === session.id ? null : session.id)}>
              {expandedSessionId === session.id ? "Hide Details" : "Show Details"}
            </button>
            <button onClick={() => handleDelete(session.id)} style={{ marginLeft: '10px', color: 'red' }}>
              Delete
            </button>

            {expandedSessionId === session.id && (
              <div className="session-details">
                <p>Weather Temp: {session.weatherTemp ?? 'N/A'}°C</p>
                <p>Weather Humidity: {session.weatherHumidity ?? 'N/A'}%</p>
                <p>Wind Speed: {session.weatherWindSpeed ?? 'N/A'} m/s</p>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;
