import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { GET_SESSIONS } from "../graphql/queries";
import {
  ADD_SESSION,
  DELETE_SESSION,
  ADD_SESSION_ACTIVITY,
  ADD_SESSION_TRANSITION,
} from "../graphql/mutations";
import SessionList from "../components/sessions/SessionList";
import SessionForm from "../components/sessions/SessionForm";
import ActivityForm from "../components/sessions/ActivityForm";
import TransitionForm from "../components/sessions/TransitionForm";
import "../index.css";
import "../styles/dashboard.css";

interface Session {
  id: string;
  sessionType: string;
  date: string;
  totalDuration: number | null;
  totalDistance: number | null;
  activities: Activity[];
}

interface Activity {
  id: string;
  sportType: string;
  distance: number;
  duration: number;
}

const Dashboard: React.FC = () => {
  const { loading, error, data, refetch } = useQuery<{ sessions: Session[] }>(
    GET_SESSIONS
  );
  const [addSession] = useMutation(ADD_SESSION, {
    refetchQueries: [{ query: GET_SESSIONS }],
  });
  const [addSessionActivity] = useMutation(ADD_SESSION_ACTIVITY, {
    refetchQueries: [{ query: GET_SESSIONS }],
  });
  const [addSessionTransition] = useMutation(ADD_SESSION_TRANSITION, {
    refetchQueries: [{ query: GET_SESSIONS }],
  });
  const [deleteSession] = useMutation(DELETE_SESSION, {
    refetchQueries: [{ query: GET_SESSIONS }],
  });

  const [showSessionForm, setShowSessionForm] = useState(false);
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [showTransitionForm, setShowTransitionForm] = useState(false);
  const [sessionType, setSessionType] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isMultiSportActive, setIsMultiSportActive] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    if (data) {
      setSessions(data.sessions ?? []);
    }
  }, [data]);

  const totalSessions = sessions.length;
  const totalDistance = sessions.reduce((acc, session) => {
    if (session.activities) {
      return acc + session.activities.reduce((d, a) => d + a.distance, 0);
    }
    return acc + (session.totalDistance || 0);
  }, 0);

  const longestSession = sessions.reduce((max, session) => {
    const distance = session.activities
      ? session.activities.reduce((d, a) => d + a.distance, 0)
      : session.totalDistance || 0;
    return distance > max ? distance : max;
  }, 0);

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this session?")) {
      await deleteSession({ variables: { id } });
      refetch();
    }
  };

  const handleSessionSubmit = async (formData: any) => {
    if (!formData.sessionType) {
      alert("Please select a session type.");
      return;
    }
    const { data } = await addSession({
      variables: {
        sessionType: formData.sessionType,
        date: formData.date,
        isMultiSport: formData.sessionType === "Multi-Sport",
        totalDuration: 0,
        totalDistance: 0,
        weatherTemp: formData.weatherTemp
          ? parseFloat(formData.weatherTemp)
          : null,
        weatherHumidity: formData.weatherHumidity
          ? parseInt(formData.weatherHumidity)
          : null,
        weatherWindSpeed: formData.weatherWindSpeed
          ? parseFloat(formData.weatherWindSpeed)
          : null,
      },
    });

    if (data?.createSession) {
      setSessions((prev) => [data.createSession, ...prev]);
      setSessionId(data.createSession.id);
      setShowSessionForm(false);
      setShowActivityForm(true);
      setIsMultiSportActive(formData.sessionType === "Multi-Sport");
      setSessionType(formData.sessionType);
      await refetch();
    }
  };

  const handleActivitySubmit = async (activityData: any) => {
    if (!sessionId) return;
    let convertedDistance = parseFloat(activityData.distance);
    if (activityData.sportType === "Swim") {
      convertedDistance = convertedDistance / 1000;
    }
    await addSessionActivity({
      variables: {
        sessionId,
        ...activityData,
        distance: convertedDistance,
      },
    });
    refetch();
    if (isMultiSportActive) {
      setShowActivityForm(false);
      setShowTransitionForm(true);
    } else {
      setShowActivityForm(false);
    }
  };

  const handleTransitionSubmit = async (transitionData: any) => {
    if (!sessionId) return;
    await addSessionTransition({
      variables: {
        sessionId,
        previousSport: transitionData.previousSport,
        nextSport: transitionData.nextSport,
        transitionTime: parseInt(transitionData.transitionTime, 10),
        comments: transitionData.comments,
      },
    });
    refetch();
    setShowTransitionForm(false);
    setShowActivityForm(true);
  };

  const handleCloseForms = () => {
    setShowActivityForm(false);
    setShowTransitionForm(false);
    setSessionId(null);
    setIsMultiSportActive(false);
  };

  const handleCancelActivityAndDeleteSession = async (id: string) => {
    try {
      await deleteSession({ variables: { id } });
    } finally {
      setShowActivityForm(false);
      setShowTransitionForm(false);
      setSessionId(null);
      setIsMultiSportActive(false);
      await refetch();
    }
  };

  return (
    <div className="dashboard">
      <h1>Session Summary</h1>

      <div className="dashboard-summary">
        <div className="summary-card">
          <h3>Total Sessions</h3>
          <p>{totalSessions}</p>
        </div>
        <div className="summary-card">
          <h3>Total Distance</h3>
          <p>{totalDistance.toFixed(1)} km</p>
        </div>
        <div className="summary-card">
          <h3>Longest Session</h3>
          <p>{longestSession.toFixed(1)} km</p>
        </div>
      </div>

      {showSessionForm && (
        <SessionForm
          onSubmit={handleSessionSubmit}
          onCancel={() => setShowSessionForm(false)}
        />
      )}
      {showActivityForm && sessionId && (
        <ActivityForm
          sessionId={sessionId}
          sessionType={sessionType}
          onSubmit={handleActivitySubmit}
          onClose={handleCloseForms}
           onCancelAndDeleteSession={handleCancelActivityAndDeleteSession}
        />
      )}
      {showTransitionForm && sessionId && (
        <TransitionForm
          sessionId={sessionId}
          onSubmit={handleTransitionSubmit}
          onClose={handleCloseForms}
        />
      )}

      <h2>All Sessions</h2>
      {loading && <p>Loading sessions...</p>}
      {error && <p className="error-message">Error fetching sessions</p>}

      <SessionList
        sessions={sessions}
        onDelete={handleDelete}
        onUpdate={refetch}
        onAddSession={() => setShowSessionForm(true)}
      />
    </div>
  );
};

export default Dashboard;
