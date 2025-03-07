import React, { useState } from "react";
import SessionDetails from "./SessionDetails";

interface SessionListProps {
  sessions: any[];
  onDelete: (id: string) => void;
}

const SessionList: React.FC<SessionListProps> = ({ sessions, onDelete }) => {
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);

  const calculateTotalDistance = (session: any) => {
    if (session.activities && session.activities.length > 0) {
      return session.activities.reduce((acc: number, activity: any) => {
        if (session.sessionType === "Swim") {
          return acc + activity.distance * 1000;
        } else {
          return acc + activity.distance;
        }
      }, 0);
    }
    return session.totalDistance || 0;
  };
  

  return (
    <div>
      {sessions.length === 0 ? <p>No sessions available.</p> : null}

      <ul>
        {sessions.map((session) => (
          <li key={session.id}>
            <strong>
              {session.sessionType} {new Date(session.date).toLocaleDateString()} - 
              {session.sessionType === "Swim"
                ? `${calculateTotalDistance(session).toFixed(0)} m`
                : `${calculateTotalDistance(session).toFixed(2)} km`}
            </strong>
            <br />
            <button onClick={() => setExpandedSessionId(expandedSessionId === session.id ? null : session.id)}>
              {expandedSessionId === session.id ? "Hide Details" : "Show Details"}
            </button>
            <button onClick={() => onDelete(session.id)} style={{ marginLeft: "10px", color: "red" }}>
              Delete
            </button>

            {expandedSessionId === session.id && <SessionDetails session={session} />}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SessionList;
