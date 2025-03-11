import React, { useState } from "react";
import SessionDetails from "./SessionDetails";
import EditSessionForm from "./EditSessionForm";
import EditActivityForm from "./EditActivityForm";

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
        if (session.sessionType === "Swim") {
          return acc + activity.distance * 1000;
        } else {
          return acc + activity.distance;
        }
      }, 0);
    }
    return session.totalDistance || 0;
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

            <h4>Filter by Distance</h4>
          <label>
            Min:{" "}
            <input
              type="number"
              value={minDistance}
              onChange={(e) => setMinDistance(e.target.value)}
              placeholder="Enter distance"
              style={{ marginRight: "10px" }}
            />
          </label>

          <label>
            Max:{" "}
            <input
              type="number"
              value={maxDistance}
              onChange={(e) => setMaxDistance(e.target.value)}
              placeholder="Enter distance"
            />
          </label>

          <div>
            <label style={{ marginLeft: "10px" }}>
              <input
                type="radio"
                name="distanceUnit"
                value="m"
                checked={distanceUnit === "m"}
                onChange={() => setDistanceUnit("m")}
              />
              m
            </label>

            <label>
              <input
                type="radio"
                name="distanceUnit"
                value="km"
                checked={distanceUnit === "km"}
                onChange={() => setDistanceUnit("km")}
              />
              km
            </label>
          </div>

          <h4>Sort by</h4>
          <button onClick={() => setSortOrder("date-desc")}>Most Recent</button>
          <button onClick={() => setSortOrder("date-asc")}>Oldest First</button>
          <button onClick={() => setSortOrder("asc")}>Distance (Lowest First)</button>
          <button onClick={() => setSortOrder("desc")}>Distance (Highest First)</button>

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

            {expandedSessionId === session.id && (
            <>
            <button onClick={() => setEditingSessionId(session.id)} style={{ marginLeft: "10px" }}>
              Edit Session
            </button>
            <button onClick={() => onDelete(session.id)} style={{ marginLeft: "10px", color: "red" }}>
              Delete Session
            </button>
            <SessionDetails session={session} onUpdate={onUpdate} />

            <h4>Activities:</h4>
            <ul>
              {session.activities.map((activity: { id: string; sportType: string; distance: number; duration: number }) => (
                <li key={activity.id}>
                  <strong>{activity.sportType}</strong> - {activity.distance} km, {activity.duration} sec
                  <button onClick={() => setEditingActivityId(activity.id)} style={{ marginLeft: "10px" }}>
                    Edit Activity
                  </button>
                </li>
              ))}
            </ul>
            </>
            )}

            {editingSessionId === session.id && (
              <EditSessionForm 
                session={session} 
                onClose={() => setEditingSessionId(null)}
                onUpdate={onUpdate}
              />
            )}

            {editingActivityId && (
            <EditActivityForm 
              activity={editingActivityId}
              onClose={() => setEditingActivityId(null)}
              onUpdate={onUpdate}
            />
          )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SessionList;
