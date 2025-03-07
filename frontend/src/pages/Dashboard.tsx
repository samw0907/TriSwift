import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_SESSIONS } from '../graphql/queries';
import { ADD_SESSION, DELETE_SESSION, ADD_SESSION_ACTIVITY, ADD_SESSION_TRANSITION } from '../graphql/mutations';
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
  transitions: Transition[];
  created_at: string;
  updated_at: string;
}
interface Activity {
  id: string
  sportType: string;
  duration: number;
  distance: number;
  heartRateMin?: number;
  heartRateMax?: number;
  heartRateAvg?: number;
  cadence?: number;
  power?: number;
}

interface Transition {
  id: string;
  previousSport: string;
  nextSport: string;
  transitionTime: number;
  comments?: string;
}


const Dashboard: React.FC = () => {
  const { loading, error, data, refetch } = useQuery<{ sessions: Session[] }>(GET_SESSIONS);
  const [addSession] = useMutation(ADD_SESSION, { refetchQueries: [{ query: GET_SESSIONS }] });
  const [addSessionActivity] = useMutation(ADD_SESSION_ACTIVITY, { refetchQueries: [{ query: GET_SESSIONS }] });
  const [addSessionTransition] = useMutation(ADD_SESSION_TRANSITION, { refetchQueries: [{ query: GET_SESSIONS }] });
  const [deleteSession] = useMutation(DELETE_SESSION, { refetchQueries: [{ query: GET_SESSIONS }] });

  const [showSessionForm, setShowSessionForm] = useState(false);
  const [showInputForm, setShowInputForm] = useState(false);
  const [selectedFormType, setSelectedFormType] = useState<'activity' | 'transition'>('activity');
  const [sessionType, setSessionType] = useState('');
  const [activityType, setActivityType] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
  const [isMultiSportActive, setIsMultiSportActive] = useState(false);
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

  const [transitionForm, setTransitionForm] = useState({
    previousSport: '',
    nextSport: '',
    transitionTime: '',
    comments: '',
  });

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this session?')) {
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
        setShowInputForm(true);
        setIsMultiSportActive(sessionType === 'Multi-Sport');
      }
    } catch (error) {
      console.error("❌ Error Creating Session:", error);
      alert("Failed to create session. Please try again.");
    }
  };

  const handleSingleActivitySubmission = async (sessionId: string, sportType: string) => {
    if (!sessionId) {
      alert("Session ID is missing. Please create a session first.");
      return;
    }
  
    if (!sportType) {
      alert("Sport Type is required.");
      return;
    }
  
    if (!activityForm.distance) {
      alert("Distance is required.");
      return;
    }
  
    const durationInSeconds =
      (parseInt(activityForm.hours) || 0) * 3600 +
      (parseInt(activityForm.minutes) || 0) * 60 +
      (parseInt(activityForm.seconds) || 0);
  
    if (durationInSeconds <= 0) {
      alert("Duration must be greater than 0.");
      return;
    }
    
    let convertedDistance = parseFloat(activityForm.distance);
    if (sportType === "Swim") {
      convertedDistance /= 1000;
    }
  
    try {
      const { data } = await addSessionActivity({
        variables: {
          sessionId,
          sportType,
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
        console.log("✅ Activity Created:", data.createSessionActivity);

        setSessions((prevSessions) =>
          prevSessions.map((session) =>
            session.id === sessionId
              ? {
                  ...session,
                  activities: [...(session.activities || []), data.createSessionActivity],
                  totalDistance: (session.totalDistance || 0) + data.createSessionActivity.distance,
                  totalDuration: (session.totalDuration || 0) + data.createSessionActivity.duration,
                }
              : session
          )
        );
        console.log("✅ Session updated with new activity");
      }

      await refetch();
    } catch (error: any) {
      console.error("❌ Error Creating Activity:", error);

      if (error.message.includes("GraphQL error")) {
        alert("Server error while creating activity. Please try again.");
      } else {
        alert("Failed to create activity. Please check your input and try again.");
      }
    }
  };

  const handleInputSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!sessionId) {
      alert("Session ID is missing. Please create a session first.");
      return;
    }
  
    if (!activityType) {
      if (sessionType === 'Multi-Sport' && !activityType) {
        alert("Please select an activity type for Multi-Sport sessions.");
        return;
      }
  
      if (!activityForm.distance) {
        alert("Distance is required.");
        return;
      }
  
      const durationInSeconds =
        (parseInt(activityForm.hours) || 0) * 3600 +
        (parseInt(activityForm.minutes) || 0) * 60 +
        (parseInt(activityForm.seconds) || 0);
  
      let convertedDistance = parseFloat(activityForm.distance);
      if (activityType === 'Swim') {
        convertedDistance = convertedDistance / 1000;
      }
  
      try {
        const { data } = await addSessionActivity({
          variables: {
            sessionId,
            sportType: activityType,
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
                    activities: [...(session.activities || []), data.createSessionActivity],
                    totalDistance:
                      (session.totalDistance || 0) +
                      (activityType === "Swim"
                        ? data.createSessionActivity.distance
                        : data.createSessionActivity.distance),
                    totalDuration: (session.totalDuration || 0) + data.createSessionActivity.duration,
                  }
                : session
            )
          );
        }
  
        setActivityForm({ hours: '', minutes: '', seconds: '', distance: '', heartRateMin: '', heartRateMax: '', heartRateAvg: '', cadence: '', power: '' });
  
      } catch (error) {
        console.error("❌ Error Creating Activity:", error);
        alert("Failed to create activity. Please try again.");
      }
    } else {
      if (!transitionForm.previousSport || !transitionForm.nextSport) {
        alert("Previous and Next sports are required for a transition.");
        return;
      }
  
      try {
        const { data } = await addSessionTransition({
          variables: {
            sessionId,
            previousSport: transitionForm.previousSport,
            nextSport: transitionForm.nextSport,
            transitionTime: parseInt(transitionForm.transitionTime),
            comments: transitionForm.comments || null,
          },
        });
  
        if (data?.createSessionTransition) {
          setSessions((prevSessions) =>
            prevSessions.map((session) =>
              session.id === sessionId
                ? {
                    ...session,
                    transitions: [...(session.transitions || []), data.createSessionTransition],
                    totalDuration: (session.totalDuration || 0) + data.createSessionTransition.transitionTime,
                  }
                : session
            )
          );
        }
  
        setTransitionForm({ previousSport: '', nextSport: '', transitionTime: '', comments: '' });
  
      } catch (error) {
        console.error("❌ Error Creating Transition:", error);
        alert("Failed to create transition. Please try again.");
      }
    }
    await refetch();
  };  

  return (
    <div className="dashboard">
      <h1>Session Dashboard</h1>
  
      {!showSessionForm && !showInputForm && (
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
  
  {showInputForm && (
      <div className="input-form-container">
        {isMultiSportActive && (
          <div className="toggle-buttons">
            <button
              type="button"
              className={selectedFormType === 'activity' ? 'active' : ''}
              onClick={() => setSelectedFormType('activity')}
            >
              Add Activity
            </button>
            <button
              type="button"
              className={selectedFormType === 'transition' ? 'active' : ''}
              onClick={() => setSelectedFormType('transition')}
            >
              Add Transition
            </button>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (isMultiSportActive) {
              handleInputSubmit(e);
            } else {
              if (sessionId) {
                handleSingleActivitySubmission(sessionId, sessionType);
              } else {
                console.error("Session ID is null. Cannot submit activity.");
                alert("Session creation failed. Please try again.");
              }
            }
          }}
              className="input-form"
            >
              {selectedFormType === 'activity' ? (
                <>
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
              <input type="number" value={activityForm.distance} onChange={(e) => setActivityForm({ ...activityForm, distance: e.target.value })} required />
            </>
          ) : (
            <>
              <label>Previous Sport:</label>
              <select value={transitionForm.previousSport} onChange={(e) => setTransitionForm({ ...transitionForm, previousSport: e.target.value })} required>
                <option value="">Select Sport</option>
                <option value="Swim">Swim</option>
                <option value="Bike">Bike</option>
                <option value="Run">Run</option>
              </select>

              <label>Next Sport:</label>
              <select value={transitionForm.nextSport} onChange={(e) => setTransitionForm({ ...transitionForm, nextSport: e.target.value })} required>
                <option value="">Select Sport</option>
                <option value="Swim">Swim</option>
                <option value="Bike">Bike</option>
                <option value="Run">Run</option>
              </select>

              <label>Transition Time (seconds):</label>
              <input type="number" value={transitionForm.transitionTime} onChange={(e) => setTransitionForm({ ...transitionForm, transitionTime: e.target.value })} required />

              <label>Comments:</label>
              <textarea value={transitionForm.comments} onChange={(e) => setTransitionForm({ ...transitionForm, comments: e.target.value })} />
            </>
          )}

          <button type="submit">Submit</button>
          <button type="button" onClick={() => setShowInputForm(false)}>Next</button>
          <button type="button" onClick={() => setShowInputForm(false)}>Cancel</button>
        </form>
      </div>
    )}
  
      <h2>Past Sessions</h2>
      {loading && <p>Loading sessions...</p>}
      {error && <p style={{ color: 'red' }}>Error fetching sessions</p>}
      {sessions.length === 0 && <p>No sessions available.</p>}
  
      <ul>
        {sessions.map((session) => {
          const computedTotalDistance = (session.activities ?? []).reduce((sum, activity) => {
            return sum + (activity.distance || 0);
          }, 0);

          return (
            <li key={session.id}>
              <strong>
                {session.sessionType} {new Date(session.date).toLocaleDateString()} - 
                {computedTotalDistance.toFixed(2)} km
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
          
                  <h3>Session Timeline</h3>
                  <ul>
                    {(() => {
                      let orderedItems: (Activity | Transition)[] = [];
                      let remainingTransitions = [...session.transitions];
          
                      let currentActivity: Activity | undefined = session.activities.length > 0 ? session.activities[0] : undefined;
          
                      while (currentActivity) {
                        orderedItems.push(currentActivity);
                        

                        let nextTransitionIndex = remainingTransitions.findIndex(
                          (t) => t.previousSport === currentActivity!.sportType
                        );
          
                        if (nextTransitionIndex !== -1) {
                          const transition = remainingTransitions.splice(nextTransitionIndex, 1)[0];
                          orderedItems.push(transition);
    
                          currentActivity = session.activities.find(
                            (act) => act.sportType === transition.nextSport
                          ) || undefined;
                        } else {
                          currentActivity = undefined;
                        }
                      }
          
                      return orderedItems.map((item) => {
                        if ("sportType" in item) {
                          return (
                            <li key={item.id}>
                              <p><strong>{item.sportType}</strong></p>
                              <p>
                                Distance: {item.sportType === 'Swim' 
                                  ? `${(item.distance * 1000).toFixed(0)} m` 
                                  : `${item.distance.toFixed(2)} km`}
                              </p>
                              <p>Duration: {formatDuration(item.duration)}</p>
                              {item.heartRateAvg && <p>Avg HR: {item.heartRateAvg} bpm</p>}
                              {item.cadence && <p>Cadence: {item.cadence} rpm</p>}
                              {item.power && <p>Power: {item.power} watts</p>}
                            </li>
                          );
                        } else {
                          return (
                            <li key={item.id} className="transition">
                              <p><strong>Transition: {item.previousSport} → {item.nextSport}</strong></p>
                              <p>Transition Time: {formatDuration(item.transitionTime)}</p>
                              {item.comments && <p>Notes: {item.comments}</p>}
                            </li>
                          );
                        }
                      });
                    })()}
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
