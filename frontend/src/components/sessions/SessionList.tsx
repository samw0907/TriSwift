import React, { useState } from "react";
import SessionDetails from "./SessionDetails";

interface SessionListProps {
  sessions: any[];
  onDelete: (id: string) => void;
}

const SessionList: React.FC<SessionListProps> = ({ sessions, onDelete }) => {
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>(["Multi-Sport", "Run", "Bike", "Swim"]);

  const toggleFilter = (filter: string) => {
    setSelectedFilters((prev) =>
      prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]
    );
  };

  const filteredSessions = sessions.filter((session) => selectedFilters.includes(session.sessionType));

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

      <button onClick={() => setShowFilters((prev) => !prev)}>
        {showFilters ? "Hide Filters" : "Show Filters"}
      </button>

      {showFilters && (
        <div className="filter-options">
          {["Multi-Sport", "Run", "Bike", "Swim"].map((type) => (
            <label key={type} style={{ marginRight: "10px" }}>
              <input
                type="checkbox"
                checked={selectedFilters.includes(type)}
                onChange={() => toggleFilter(type)}
              />
              {type}
            </label>
          ))}
        </div>
      )}

      {filteredSessions.length === 0 ? <p>No sessions available.</p> : null}

      <ul>
        {filteredSessions.map((session) => (
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
