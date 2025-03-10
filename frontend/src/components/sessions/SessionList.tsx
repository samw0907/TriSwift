import React, { useState } from "react";
import SessionDetails from "./SessionDetails";

interface SessionListProps {
  sessions: any[];
  onDelete: (id: string) => void;
}

const SessionList: React.FC<SessionListProps> = ({ sessions, onDelete }) => {
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  const toggleFilter = (filter: string) => {
    setSelectedFilters((prev) =>
      prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]
    );
  };

  const clearFilters = () => {
    setSelectedFilters([]);
    setFromDate("");
    setToDate("");
  };

  const filteredSessions = sessions.filter((session) => {
    const sessionDate = new Date(session.date);

    const typeFilterPass =
      selectedFilters.length === 0 || selectedFilters.includes(session.sessionType);

    const fromPass = fromDate ? sessionDate >= new Date(fromDate) : true;
    const toPass = toDate ? sessionDate <= new Date(toDate) : true;

    return typeFilterPass && fromPass && toPass;
  });

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

      <div style={{ marginBottom: "10px" }}>
      <button onClick={() => setShowFilters((prev) => !prev)}>
        {showFilters ? "Hide Filters" : "Show Filters"}
      </button>
        {showFilters && (
          <button onClick={clearFilters} style={{ marginLeft: "10px" }}>
            Clear Filters
      </button>
        )}
      </div>

      {showFilters && (
        <div className="filter-options">
          <h4>Filter by Session Type</h4>
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

          <h4>Filter by Date</h4>
            <label>
              From:{" "}
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                style={{ marginRight: "10px" }}
              />
            </label>

            <label>
              To:{" "}
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </label>
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
