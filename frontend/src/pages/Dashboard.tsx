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
  const [activityType, setActivityType] = useState('');
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

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

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

    if (sessionType === 'Multi-Sport' && !activityType) {
      alert("Please select an activity type for Multi-Sport sessions.");
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

    let convertedDistance = parseFloat(activityForm.distance);
    const sport = sessionType === 'Multi-Sport' ? activityType : sessionType;
  
    if (sport === 'Swim') {
      convertedDistance = convertedDistance / 1000;
    }

    try {
      const { data } = await addSessionActivity({
        variables: {
          sessionId,
          sportType: sessionType === 'Multi-Sport' ? activityType : sessionType,
          duration: durationInSeconds,
          distance: convertedDistance,
          heartRateMin: activityForm.heartRateMin ? parseInt(activityForm.heartRateMin) : null,
          heartRateMax: activityForm.heartRateMax ? parseInt(activityForm.heartRateMax) : null,
          heartRateAvg: activityForm.heartRateAvg ? parseInt(activityForm.heartRateAvg) : null,
          cadence: activityForm.cadence ? parseInt(activityForm.cadence) : null,
          power: activityForm.power ? parseInt(activityForm.power) : null,
        },
      });
  
      if (data?.createSessionActivity) {
        setSessions((prevSessions) =>
          prevSessions.map((session) =>
            session.id === sessionId
              ? {
                  ...session,
                  activities: session.activities ? [...session.activities, data.createSessionActivity] : [data.createSessionActivity],
                  totalDistance: (session.totalDistance || 0) + data.createSessionActivity.distance,
                  totalDuration: (session.totalDuration || 0) + data.createSessionActivity.duration,
                }
              : session
          )
        );
      }

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
  
          <label>Weather Temp (°C):</label>
          <input type="number" name="weatherTemp" value={sessionForm.weatherTemp} onChange={(e) => setSessionForm({ ...sessionForm, weatherTemp: e.target.value })} />
  
          <label>Weather Humidity (%):</label>
          <input type="number" name="weatherHumidity" value={sessionForm.weatherHumidity} onChange={(e) => setSessionForm({ ...sessionForm, weatherHumidity: e.target.value })} />
  
          <label>Wind Speed (m/s):</label>
          <input type="number" name="weatherWindSpeed" value={sessionForm.weatherWindSpeed} onChange={(e) => setSessionForm({ ...sessionForm, weatherWindSpeed: e.target.value })} />
  
          <button type="submit">Next</button>
          <button type="button" onClick={() => setShowSessionForm(false)}>Cancel</button>
        </form>
      )}
  
      {showActivityForm && (
        <form onSubmit={handleActivitySubmit} className="activity-form">
          {sessionType === 'Multi-Sport' && (
            <>
              <label>Activity Type:</label>
              <select value={activityType} onChange={(e) => setActivityType(e.target.value)} required>
                <option value="">Select Activity</option>
                <option value="Swim">Swim</option>
                <option value="Bike">Bike</option>
                <option value="Run">Run</option>
              </select>
            </>
          )}
  
          <label>Duration:</label>
          <div>
            <input type="number" placeholder="Hours" value={activityForm.hours} onChange={(e) => setActivityForm({ ...activityForm, hours: e.target.value })} />
            <input type="number" placeholder="Minutes" value={activityForm.minutes} onChange={(e) => setActivityForm({ ...activityForm, minutes: e.target.value })} />
            <input type="number" placeholder="Seconds" value={activityForm.seconds} onChange={(e) => setActivityForm({ ...activityForm, seconds: e.target.value })} />
          </div>
  
          <label>Distance ({(sessionType === 'Swim' || activityType === 'Swim') ? 'm' : 'km'}):</label>
          <input
            type="number"
            value={activityForm.distance}
            onChange={(e) => setActivityForm({ ...activityForm, distance: e.target.value })}
            required
          />
  
          <label>Heart Rate (bpm):</label>
          <div>
            <input type="number" placeholder="Min" value={activityForm.heartRateMin} onChange={(e) => setActivityForm({ ...activityForm, heartRateMin: e.target.value })} />
            <input type="number" placeholder="Max" value={activityForm.heartRateMax} onChange={(e) => setActivityForm({ ...activityForm, heartRateMax: e.target.value })} />
            <input type="number" placeholder="Avg" value={activityForm.heartRateAvg} onChange={(e) => setActivityForm({ ...activityForm, heartRateAvg: e.target.value })} />
          </div>
  
          <label>Cadence (rpm):</label>
          <input type="number" value={activityForm.cadence} onChange={(e) => setActivityForm({ ...activityForm, cadence: e.target.value })} />
  
          <label>Power (watts):</label>
          <input type="number" value={activityForm.power} onChange={(e) => setActivityForm({ ...activityForm, power: e.target.value })} />
  
          <button type="submit">Submit Activity</button>
          <button type="button" onClick={() => setShowActivityForm(false)}>Cancel</button>
        </form>
      )}
  
      <h2>Past Sessions</h2>
      {loading && <p>Loading sessions...</p>}
      {error && <p style={{ color: 'red' }}>Error fetching sessions</p>}
      {sessions.length === 0 && <p>No sessions available.</p>}
  
      <ul>
        {sessions.map((session) => {
          // Ensure activities is always an array
          const activities = session.activities ?? [];
          const isSingleSwim = session.sessionType === 'Swim' && activities.length === 1;
  
          return (
            <li key={session.id}>
              <strong>
                {session.sessionType} {new Date(session.date).toLocaleDateString()} - 
                {session.totalDistance !== null 
                  ? isSingleSwim 
                    ? ` ${session.totalDistance * 1000}m`
                    : ` ${session.totalDistance}km`
                  : ''}
                {session.totalDuration ? ` - ${formatDuration(session.totalDuration)}` : ''}
              </strong>
              <br />
              <button onClick={() => setExpandedSessionId(expandedSessionId === session.id ? null : session.id)}>
                {expandedSessionId === session.id ? "Hide Details" : "Show Details"}
              </button>
              <button onClick={() => handleDelete(session.id)} style={{ marginLeft: '10px', color: 'red' }}>
                Delete
              </button>
  
              {expandedSessionId === session.id && (
                <div className="session-details">
                  <p>Temp - {session.weatherTemp ?? 'N/A'}°C</p>
                  <p>Humidity - {session.weatherHumidity ?? 'N/A'}%</p>
                  <p>Wind Speed - {session.weatherWindSpeed ?? 'N/A'}m/s</p>
  
                  <h3>Activities</h3>
                  <ul>
                    {activities.length > 0 ? (
                      activities.map((activity) => (
                        <li key={activity.id}>
                          <p><strong>{activity.sportType}</strong></p>
                          <p>
                            Distance: {activity.sportType === 'Swim' ? `${activity.distance * 1000} m` : `${activity.distance} km`}
                          </p>
                          <p>Duration: {formatDuration(activity.duration)}</p>
                          {activity.heartRateAvg && <p>Avg HR: {activity.heartRateAvg} bpm</p>}
                          {activity.cadence && <p>Cadence: {activity.cadence} rpm</p>}
                          {activity.power && <p>Power: {activity.power} watts</p>}
                        </li>
                      ))
                    ) : (
                      <p>No activities recorded for this session.</p>
                    )}
                  </ul>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Dashboard;
