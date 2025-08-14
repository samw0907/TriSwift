import React, { useState, useEffect, useRef } from "react";
import SessionDetails from "./SessionDetails";
import EditSessionForm from "./EditSessionForm";
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
  onAddSession: () => void;
}

const SessionList: React.FC<SessionListProps> = ({
  sessions,
  onDelete,
  onUpdate,
  onAddSession,
}) => {
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [minDistance, setMinDistance] = useState<string>("");
  const [maxDistance, setMaxDistance] = useState<string>("");
  const [distanceUnit, setDistanceUnit] = useState<"m" | "km">("km");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | "date-desc" | "date-asc">("date-desc");
  const [gridView, setGridView] = useState(() => window.innerWidth >= 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const fromRef = useRef<HTMLInputElement>(null);
  const toRef = useRef<HTMLInputElement>(null);

  const openDatePicker = (el: HTMLInputElement | null) => {
    if (!el) return;
    el.focus();
    // @ts-ignore progressive enhancement
    if (el.showPicker) el.showPicker();
  };

  useEffect(() => {
    const handleResize = () => {
      const isNowMobile = window.innerWidth < 768;
      setIsMobile(isNowMobile);
      setGridView(!isNowMobile);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
        const distance =
          typeof activity.distance === "number"
            ? activity.distance
            : parseFloat(activity.distance);
        if (isNaN(distance)) return acc;
        return acc + distance;
      }, 0);
    }
    const fallback =
      typeof session.totalDistance === "number"
        ? session.totalDistance
        : parseFloat(session.totalDistance);
    return isNaN(fallback) ? 0 : fallback;
  };

  const calculateTotalTime = (session: any) => {
    if (!session.activities || session.activities.length === 0) return 0;
    return session.activities.reduce(
      (acc: number, activity: any) => acc + activity.duration,
      0
    );
  };

  const formatTotalTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(seconds).padStart(2, "0")}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
       const year = String(date.getFullYear()).slice(-2);
    return `${day}/${month}/${year}`;
  };

  const calculatePace = (session: Session): string | null => {
    if (!session.activities || session.activities.length !== 1) return null;
    const activity = session.activities[0];
    if (activity.distance <= 0 || activity.duration <= 0) return null;

    if (activity.sportType === "Run") {
      const pacePerKm = activity.duration / activity.distance;
      const minutes = Math.floor(pacePerKm / 60);
      const seconds = Math.round(pacePerKm % 60);
      return `${minutes}:${seconds.toString().padStart(2, "0")} / km`;
    }
    if (activity.sportType === "Bike") {
      const speedKmH = (activity.distance / activity.duration) * 3600;
      return `${speedKmH.toFixed(1)} km/h`;
    }
    if (activity.sportType === "Swim") {
      const distanceMeters = activity.distance * 1000;
      const pacePer100m = activity.duration / (distanceMeters / 100);
      const minutes = Math.floor(pacePer100m / 60);
      const seconds = Math.round(pacePer100m % 60);
      return `${minutes}:${seconds.toString().padStart(2, "0")} / 100m`;
    }
    return null;
  };

  const getSportColor = (type: string) => {
    if (type === "Run") return "#ff4e4e";
    if (type === "Bike") return "#28a745";
    if (type === "Swim") return "#5ce0d8";
    return "#e1e2e2";
  };

  const filteredSessions = sessions
    .filter((session) => {
      const sessionDate = new Date(session.date);
      const sessionDistance = calculateTotalDistance(session);

      const minDistanceKm =
        minDistance !== ""
          ? parseFloat(minDistance) / (distanceUnit === "m" ? 1000 : 1)
          : null;
      const maxDistanceKm =
        maxDistance !== ""
          ? parseFloat(maxDistance) / (distanceUnit === "m" ? 1000 : 1)
          : null;

      const minPass = minDistanceKm !== null ? sessionDistance >= minDistanceKm : true;
      const maxPass = maxDistanceKm !== null ? sessionDistance <= maxDistanceKm : true;

      const typeFilterPass =
        selectedFilters.length === 0 || selectedFilters.includes(session.sessionType);

      const fromPass = fromDate ? sessionDate >= new Date(fromDate) : true;
      const toPass = toDate ? sessionDate <= new Date(toDate) : true;

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

  const cardsPerRow = 3;
  const rows: React.ReactNode[] = [];

  for (let i = 0; i < filteredSessions.length; i += cardsPerRow) {
    const rowSessions = filteredSessions.slice(i, i + cardsPerRow);

    rowSessions.forEach((session) => {
      if (expandedSessionId === session.id) {
        rows.push(
          <div className="expanded-row" key={`expanded-${session.id}`}>
            <div
              className="session-card expanded-card"
              style={{
                borderLeft: `5px solid ${getSportColor(session.sessionType)}`,
              }}
              onClick={() =>
                setExpandedSessionId(
                  expandedSessionId === session.id ? null : session.id
                )
              }
            >
              <div className="session-top-row">
                <h3>{session.sessionType}</h3>
                <p className="session-date">{formatDate(session.date)}</p>
                <p className="session-stats">
                  {formatTotalTime(
                    (session.activities || []).reduce(
                      (acc: number, activity: any) => acc + activity.duration,
                      0
                    )
                  )}
                </p>
                <p className="session-stats">
                  {session.sessionType === "Swim"
                    ? `${(calculateTotalDistance(session) * 1000).toFixed(0)} m`
                    : `${calculateTotalDistance(session).toFixed(2)} km`}
                </p>
              </div>
              <div
                className="session-actions icon-actions"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="icon-btn edit-btn"
                  title="Edit Session"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingSessionId(session.id);
                  }}
                >
                  ✏️
                </button>
                <button
                  className="icon-btn delete-btn"
                  title="Delete Session"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(session.id);
                  }}
                >
                  🗑
                </button>
              </div>
              {editingSessionId === session.id && (
                <div onClick={(e) => e.stopPropagation()}>
                  <EditSessionForm
                    session={session}
                    onClose={() => setEditingSessionId(null)}
                    onUpdate={onUpdate}
                  />
                </div>
              )}
              <div onClick={(e) => e.stopPropagation()}>
                <SessionDetails session={session} onUpdate={onUpdate} />
              </div>
            </div>
          </div>
        );
      } else {
        rows.push(
          <div className="session-card-wrapper" key={session.id}>
            <div
              className="session-card"
              style={{
                borderLeft: `5px solid ${getSportColor(session.sessionType)}`,
              }}
              onClick={() =>
                setExpandedSessionId(
                  expandedSessionId === session.id ? null : session.id
                )
              }
            >
              <div className="session-top-row">
                <h3 className={gridView ? "small-heading" : ""}>
                  {session.sessionType}
                </h3>
                <p className={`session-date ${gridView ? "small-text" : ""}`}>
                  {formatDate(session.date)}
                </p>
                <p className={`session-stats ${gridView ? "small-text" : ""}`}>
                  {formatTotalTime(
                    (session.activities || []).reduce(
                      (acc: number, activity: any) => acc + activity.duration,
                      0
                    )
                  )}
                </p>
                <p className={`session-stats ${gridView ? "small-text" : ""}`}>
                  {session.sessionType === "Swim"
                    ? `${(calculateTotalDistance(session) * 1000).toFixed(0)} m`
                    : `${calculateTotalDistance(session).toFixed(2)} km`}
                </p>
              </div>
            </div>
          </div>
        );
      }
    });
  }

  return (
    <div className={`session-list-container ${gridView ? "grid-view" : ""}`}>
      <div className="filter-controls-wrapper">
        <div className="left-controls">
          <button className="btn-primary add-session-btn" onClick={onAddSession}>
            Add Session
          </button>
        </div>

        <div className="right-controls">
          {showFilters ? (
            <>
              {/* Swapped order: Clear first, then Hide */}
              <button className="btn-clear-filters" onClick={clearFilters}>
                Clear Filters
              </button>
              <button
                className="btn-filter-toggle"
                onClick={() => setShowFilters(false)}
              >
                Hide Filters
              </button>
            </>
          ) : (
            <button
              className="btn-filter-toggle"
              onClick={() => setShowFilters(true)}
            >
              Show Filters
            </button>
          )}
          {!isMobile && (
            <button
              className={`toggle-btn ${gridView ? "active" : ""}`}
              onClick={() => setGridView((prev) => !prev)}
            >
              {gridView ? "List View" : "Grid View"}
            </button>
          )}
        </div>
      </div>

      {showFilters && (
        <div className="filter-options">
          <div className="filter-row">
            <div className="filter-group inline">
              <span className="group-label">Session Types:</span>
              {["Swim", "Bike", "Run", "Multi-Sport"].map((type) => (
                <label className="chk" key={type}>
                  <input
                    type="checkbox"
                    checked={selectedFilters.includes(type)}
                    onChange={() => toggleFilter(type)}
                  />
                  <span>{type}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="filter-row">
            <div className="filter-group dates">
              <span className="group-label">Dates:</span>
              <div className="date-fields">
                <div
                  className="date-field"
                  tabIndex={0}
                  onClick={() => openDatePicker(fromRef.current)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") openDatePicker(fromRef.current);
                  }}
                >
                  <span className="date-caption">From</span>
                  <input
                    ref={fromRef}
                    type="date"
                    className="date-input"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                  />
                </div>

                <div
                  className="date-field"
                  tabIndex={0}
                  onClick={() => openDatePicker(toRef.current)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") openDatePicker(toRef.current);
                  }}
                >
                  <span className="date-caption">To</span>
                  <input
                    ref={toRef}
                    type="date"
                    className="date-input"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Row 3: Min, Max, Unit on same row */}
          <div className="filter-row">
            <div className="filter-group trio-row">
              <div className="trio-item">
                <label>Min Distance:</label>
                <input
                  type="number"
                  value={minDistance}
                  onChange={(e) => setMinDistance(e.target.value)}
                />
              </div>

              <div className="trio-item">
                <label>Max Distance:</label>
                <input
                  type="number"
                  value={maxDistance}
                  onChange={(e) => setMaxDistance(e.target.value)}
                />
              </div>

              <div className="trio-item">
                <label>Unit:</label>
                <select
                  value={distanceUnit}
                  onChange={(e) => setDistanceUnit(e.target.value as "m" | "km")}
                >
                  <option value="km">km</option>
                  <option value="m">m</option>
                </select>
              </div>
            </div>
          </div>

          <div className="filter-row">
            <div className="filter-group">
              <label>Sort By:</label>
              <select
                value={sortOrder}
                onChange={(e) =>
                  setSortOrder(
                    e.target.value as "asc" | "desc" | "date-desc" | "date-asc"
                  )
                }
              >
                <option value="date-desc">Date (Newest)</option>
                <option value="date-asc">Date (Oldest)</option>
                <option value="desc">Distance (Longest)</option>
                <option value="asc">Distance (Shortest)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {!gridView && (
        <ul className="session-list">
          {filteredSessions.map((session) => {
            const totalDistance = calculateTotalDistance(session);
            const totalTime = calculateTotalTime(session);
            const pace =
              session.sessionType === "Run" ||
              session.sessionType === "Bike" ||
              session.sessionType === "Swim"
                ? calculatePace(session)
                : null;

            return (
              <li
                key={session.id}
                className="session-card"
                style={{
                  borderLeft: `5px solid ${getSportColor(session.sessionType)}`,
                }}
                onClick={() =>
                  setExpandedSessionId(
                    expandedSessionId === session.id ? null : session.id
                  )
                }
              >
                <div className="session-top-row">
                  <h3>{session.sessionType}</h3>
                  <p className="session-date">{formatDate(session.date)}</p>
                  <p className="session-stats">{formatTotalTime(totalTime)}</p>
                  <p className="session-stats">
                    {session.sessionType === "Swim"
                      ? `${(totalDistance * 1000).toFixed(0)} m`
                      : `${totalDistance.toFixed(2)} km`}
                  </p>
                  {pace ? (
                    <p className="session-stats">{pace}</p>
                  ) : (
                    <p className="session-stats placeholder">&nbsp;</p>
                  )}
                </div>

                {expandedSessionId === session.id && (
                  <>
                    <div
                      className="session-actions icon-actions"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        className="icon-btn edit-btn"
                        title="Edit Session"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingSessionId(session.id);
                        }}
                      >
                        ✏️
                      </button>
                      <button
                        className="icon-btn delete-btn"
                        title="Delete Session"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(session.id);
                        }}
                      >
                        🗑
                      </button>
                    </div>
                    {editingSessionId === session.id && (
                      <div onClick={(e) => e.stopPropagation()}>
                        <EditSessionForm
                          session={session}
                          onClose={() => setEditingSessionId(null)}
                          onUpdate={onUpdate}
                        />
                      </div>
                    )}
                    <div onClick={(e) => e.stopPropagation()}>
                      <SessionDetails session={session} onUpdate={onUpdate} />
                    </div>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {gridView && <div className="grid-container">{rows}</div>}
    </div>
  );
};

export default SessionList;
