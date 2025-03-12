import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_SESSIONS } from '../graphql/queries';
import { ADD_SESSION, DELETE_SESSION, ADD_SESSION_ACTIVITY, ADD_SESSION_TRANSITION } from '../graphql/mutations';
import SessionList from "../components/sessions/SessionList";
import SessionForm from "../components/sessions/SessionForm";
import ActivityForm from "../components/sessions/ActivityForm";
import TransitionForm from "../components/sessions/TransitionForm";
import '../index.css'
import '../styles/dashboard.css'

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
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isMultiSportActive, setIsMultiSportActive] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    if (data?.sessions) {
      setSessions(data.sessions);
    }
  }, [data]);

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

  const handleSessionSubmit = async (formData: any) => {
    if (!formData.sessionType) {
      alert("Please select a session type.");
      return;
    }

    try {
      const { data } = await addSession({
        variables: {
          sessionType: formData.sessionType,
          date: formData.date,
          isMultiSport: formData.sessionType === "Multi-Sport",
          totalDuration: 0,
          totalDistance: 0,
          weatherTemp: formData.weatherTemp ? parseFloat(formData.weatherTemp) : null,
          weatherHumidity: formData.weatherHumidity
            ? parseInt(formData.weatherHumidity)
            : null,
          weatherWindSpeed: formData.weatherWindSpeed
            ? parseFloat(formData.weatherWindSpeed)
            : null,
        },
      });

      if (data?.createSession) {
        setSessionId(data.createSession.id);
        setShowSessionForm(false);
        setShowInputForm(true);
        setIsMultiSportActive(formData.sessionType === "Multi-Sport");
        setSessionType(formData.sessionType);
      }
    } catch (error) {
      console.error("❌ Error Creating Session:", error);
      alert("Failed to create session. Please try again.");
    }
  };

  const handleActivitySubmit = async (activityData: any) => {
    if (!sessionId) {
      alert("Session ID is missing. Please create a session first.");
      return;
    }
  
    let convertedDistance = parseFloat(activityData.distance);

    if (activityData.sportType === "Swim") {
      convertedDistance = convertedDistance / 1000;
    }
  
    try {
      const { data } = await addSessionActivity({
        variables: {
          sessionId,
          ...activityData,
          distance: convertedDistance,
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
                    (session.totalDistance || 0) + convertedDistance,
                  totalDuration:
                    (session.totalDuration || 0) + data.createSessionActivity.duration,
                }
              : session
          )
        );
        refetch();
      }
    } catch (error) {
      console.error("❌ Error Creating Activity:", error);
      alert("Failed to create activity. Please try again.");
    }
  };

  const handleTransitionSubmit = async (transitionData: any) => {
    if (!sessionId) {
      alert("Session ID is missing. Please create a session first.");
      return;
    }

    try {
      const { data } = await addSessionTransition({
        variables: {
          sessionId,
          previousSport: transitionData.previousSport,
          nextSport: transitionData.nextSport,
          transitionTime: parseInt(transitionData.transitionTime, 10),
          comments: transitionData.comments,
        },
      });

      if (data?.createSessionTransition) {
        refetch();
      }
    } catch (error) {
      console.error("❌ Error Creating Transition:", error);
      alert("Failed to create transition. Please try again.");
    }
  };

  const handleUpdate = () => {
    refetch();
  };

  return (
    <div className="dashboard">
      <h1>Session Dashboard</h1>

      {!showSessionForm && !showInputForm && (
        <button onClick={() => setShowSessionForm(true)}>Add Session</button>
      )}

      {showSessionForm && (
        <SessionForm
          onSubmit={handleSessionSubmit}
          onCancel={() => setShowSessionForm(false)}
        />
      )}

      {showInputForm && sessionId && (
        <div className="input-form-container">
          {isMultiSportActive && (
            <div className="toggle-buttons">
              <button
                className={selectedFormType === "activity" ? "active" : ""}
                onClick={() => setSelectedFormType("activity")}
              >
                Add Activity
              </button>
              <button
                className={selectedFormType === "transition" ? "active" : ""}
                onClick={() => setSelectedFormType("transition")}
              >
                Add Transition
              </button>
            </div>
          )}

          {selectedFormType === "activity" ? (
            <ActivityForm
              sessionId={sessionId}
              sessionType={sessionType}
              onSubmit={handleActivitySubmit}
              onCancel={() => setShowInputForm(false)}
            />
          ) : (
            <TransitionForm
              sessionId={sessionId}
              onSubmit={handleTransitionSubmit}
              onCancel={() => setShowInputForm(false)}
            />
          )}
        </div>
      )}

      <h2>Past Sessions</h2>
      {loading && <p>Loading sessions...</p>}
      {error && <p style={{ color: "red" }}>Error fetching sessions</p>}
      {sessions.length > 0 && <SessionList sessions={sessions} onDelete={handleDelete}  onUpdate={handleUpdate}/>}
    </div>
  );
};

export default Dashboard;