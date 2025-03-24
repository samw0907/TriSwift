import React, { useState } from "react";
import SessionDetails from "./SessionDetails";
import EditSessionForm from "./EditSessionForm";
import EditActivityForm from "./EditActivityForm";
import "../../styles/sessionList.css";

interface Activity {
  id: string;
  sportType: string;
  distance: number;
  duration: number;
}

interface Session {
  id: string;
  sessionType: string;
  date: string;
  activities: Activity[];
}

interface SessionListProps {
  sessions: any[];
  onDelete: (id: string) => void;
  onUpdate: () => void;
}

const SessionList: React.FC<SessionListProps> = ({ sessions, onDelete, onUpdate }) => {
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [minDistance, setMinDistance] = useState<string>("");
  const [maxDistance, setMaxDistance] = useState<string>("");
  const [distanceUnit, setDistanceUnit] = useState<"m" | "km">("km");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | "date-desc" | "date-asc">("date-desc");

  const toggleFilter = (filter: string) => {
    setSelectedFilters((prev) =>
      prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]
    );
  };

  const clearFilters = () => {
    setSelectedFilters([]);
    setFromDate("");
    setToDate("");
    setMinDistance("");
    setMaxDistance("");
    setDistanceUnit("km");
    setSortOrder("date-desc");
  };

  const calculateTotalDistance = (session: any) => {
    if (session.activities && session.activities.length > 0) {
      return session.activities.reduce((acc: number, activity: any) => {
        const distance = typeof activity.distance === 'number'
          ? activity.distance
          : parseFloat(activity.distance);
  
        if (isNaN(distance)) return acc;
  
        const distanceKm = activity.sportType === "Swim"
          ? distance / 1000
          : distance;
  
        return acc + distanceKm;
      }, 0);
    }
  
    const fallback = typeof session.totalDistance === 'number'
      ? session.totalDistance
      : parseFloat(session.totalDistance);
  
    return isNaN(fallback) ? 0 : fallback;
  };
  

  const filteredSessions = sessions.filter((session) => {
    const sessionDate = new Date(session.date);
    const sessionDistance = calculateTotalDistance(session);

    const convertedDistance =
    distanceUnit === "m" ? sessionDistance * 1000 : sessionDistance;

    const typeFilterPass =
      selectedFilters.length === 0 || selectedFilters.includes(session.sessionType);

    const fromPass = fromDate ? sessionDate >= new Date(fromDate) : true;
    const toPass = toDate ? sessionDate <= new Date(toDate) : true;

    const minPass = minDistance !== "" ? convertedDistance >= parseFloat(minDistance): true;
    const maxPass = maxDistance !== "" ? convertedDistance <= parseFloat(maxDistance): true;

    return typeFilterPass && fromPass && toPass && minPass && maxPass;
  })
  .sort((a, b) => {
    if (sortOrder === "date-desc") {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
    if (sortOrder === "date-asc") {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    }
    if (sortOrder === "asc") {
      return calculateTotalDistance(a) - calculateTotalDistance(b);
    }
    if (sortOrder === "desc") {
      return calculateTotalDistance(b) - calculateTotalDistance(a);
    }
    return 0;
  });

  return (
    <div className="session-list-container">
      {sessions.length === 0 ? <p className="no-sessions">No sessions available.</p> : null}

      <div className="filter-controls">
      <button className="btn-filter-toggle" onClick={() => setShowFilters((prev) => !prev)}>
        {showFilters ? "Hide Filters" : "Show Filters"}
      </button>
        {showFilters && (
          <button className="btn-clear-filters" onClick={clearFilters} style={{ marginLeft: "10px" }}>
            Clear Filters
      </button>
        )}
      </div>

      {showFilters && (
        <div className="filter-options">
          <h4>Filter by Session Type</h4>
          <div className="filter-group">
          {["Multi-Sport", "Run", "Bike", "Swim"].map((type) => (
            <label key={type} className="filter-checkbox">
              <input
                type="checkbox"
                checked={selectedFilters.includes(type)}
                onChange={() => toggleFilter(type)}
              />
              {type}
            </label>
          ))}
          </div>

          <h4>Filter by Date</h4>
          <div  className="filter-group">
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

          <h4>Filter by Distance</h4>
          <div className="filter-group">
          <label>
            Min:{" "}
            <input
              type="number"
              value={minDistance}
              onChange={(e) => setMinDistance(e.target.value)}
              placeholder="Enter min distance"
            />
          </label>

          <label>
            Max:{" "}
            <input
              type="number"
              value={maxDistance}
              onChange={(e) => setMaxDistance(e.target.value)}
              placeholder="Enter max distance"
            />
          </label>
          </div>

          <h4>Distance Unit</h4>
          <div className="filter-group">
            <label>
              <input
                type="radio"
                name="distanceUnit"
                value="m"
                checked={distanceUnit === "m"}
                onChange={() => setDistanceUnit("m")}
              />
              meters
            </label>

            <label>
              <input
                type="radio"
                name="distanceUnit"
                value="km"
                checked={distanceUnit === "km"}
                onChange={() => setDistanceUnit("km")}
              />
              kilometers
            </label>
          </div>

          <h4>Sort by</h4>
          <div className="sort-buttons">
          <button 
            className={`sort-btn ${sortOrder === "date-desc" ? "active" : ""}`} 
            onClick={() => setSortOrder("date-desc")}
          >
            Most Recent
          </button>
          <button 
            className={`sort-btn ${sortOrder === "date-asc" ? "active" : ""}`} 
            onClick={() => setSortOrder("date-asc")}
          >
            Oldest First
          </button>
          <button 
            className={`sort-btn ${sortOrder === "asc" ? "active" : ""}`} 
            onClick={() => setSortOrder("asc")}
          >
            Distance (Lowest First)
          </button>
          <button 
            className={`sort-btn ${sortOrder === "desc" ? "active" : ""}`} 
            onClick={() => setSortOrder("desc")}
          >
            Distance (Highest First)
          </button>
          </div>
        </div>
      )}

      {filteredSessions.length === 0 ? <p className="no-sessions">No sessions available.</p> : null}

      <ul className="session-list">
        {filteredSessions.map((session) => (
          <li key={session.id} className="session-card" data-session-id={session.id}>
            <div className="session-info">
              <h3>{session.sessionType}</h3>
              <p className="session-date">{new Date(session.date).toLocaleDateString()}</p>
              <p className="session-distance">
                {session.sessionType === "Swim"
                  ? `${calculateTotalDistance(session).toFixed(0)} m`
                  : `${calculateTotalDistance(session).toFixed(2)} km`}
              </p>
            </div>

            <div className="session-actions">
              <button
                className={`btn-primary ${expandedSessionId === session.id ? "active" : ""}`}
                onClick={() => setExpandedSessionId(expandedSessionId === session.id ? null : session.id)}
              >
                {expandedSessionId === session.id ? "Hide Details" : "Show Details"}
              </button>

              <button
                className="btn-secondary"
                onClick={() => setEditingSessionId(session.id)}
              >
                Edit
              </button>

              <button className="btn-danger" onClick={() => onDelete(session.id)}>
                Delete
              </button>
            </div>

            {editingSessionId === session.id && (
              <EditSessionForm
                session={session}
                onClose={() => setEditingSessionId(null)}
                onUpdate={onUpdate}
              />
            )}

            {expandedSessionId === session.id && (
              <div className="session-details">
                <SessionDetails session={session} onUpdate={onUpdate} />
              </div>
            )}
        </li>
      ))}
    </ul>
  </div>
  );
};

export default SessionList;