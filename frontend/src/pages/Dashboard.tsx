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
          session_type,
          date: sessionForm.date,
          is_multi_sport: session_type === 'Multi-Sport',
          total_duration: null,
          total_distance: null,
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
    setSessionForm({ date: '' });
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
          <button type="submit">Next</button>
          <button type="button" onClick={resetForms}>Cancel</button>
        </form>
      )}

      {showActivityForm && (
        <form onSubmit={handleActivitySubmit} className="activity-form">
          <h2>Add Session Activity</h2>

          <label>Duration:</label>
          <div className="duration-input">
            <input type="number" placeholder="Hours" value={activityForm.hours} onChange={(e) => setActivityForm({ ...activityForm, hours: e.target.value })} />
            <input type="number" placeholder="Minutes" value={activityForm.minutes} onChange={(e) => setActivityForm({ ...activityForm, minutes: e.target.value })} />
            <input type="number" placeholder="Seconds" value={activityForm.seconds} onChange={(e) => setActivityForm({ ...activityForm, seconds: e.target.value })} />
          </div>

          <label>Distance (km):</label>
          <input type="number" name="distance" value={activityForm.distance} onChange={(e) => setActivityForm({ ...activityForm, distance: e.target.value })} required />

          <label>Heart Rate (Min):</label>
          <input type="number" name="heart_rate_min" value={activityForm.heart_rate_min} onChange={(e) => setActivityForm({ ...activityForm, heart_rate_min: e.target.value })} />

          <label>Heart Rate (Max):</label>
          <input type="number" name="heart_rate_max" value={activityForm.heart_rate_max} onChange={(e) => setActivityForm({ ...activityForm, heart_rate_max: e.target.value })} />

          <label>Heart Rate (Avg):</label>
          <input type="number" name="heart_rate_avg" value={activityForm.heart_rate_avg} onChange={(e) => setActivityForm({ ...activityForm, heart_rate_avg: e.target.value })} />

          <label>Cadence:</label>
          <input type="number" name="cadence" value={activityForm.cadence} onChange={(e) => setActivityForm({ ...activityForm, cadence: e.target.value })} />

          <label>Power:</label>
          <input type="number" name="power" value={activityForm.power} onChange={(e) => setActivityForm({ ...activityForm, power: e.target.value })} />

          <button type="submit">Save Activity</button>
          <button type="button" onClick={resetForms}>Cancel</button>
        </form>
      )}
    </div>
  );
};

export default Dashboard;
