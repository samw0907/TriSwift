import React, { useState, useCallback } from 'react';
import { useQuery } from '@apollo/client';
import { GET_PERSONAL_RECORDS } from '../graphql/queries';

const distances = {
  Running: [100, 200, 400, 1000, 5000, 10000, 21100, 42200],
  Cycling: [10000, 20000, 40000, 50000, 80000, 100000, 150000, 200000],
  Swimming: [100, 200, 400, 800, 1000, 1500, 2000],
};

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${minutes}:${sec < 10 ? '0' : ''}${sec}`;
};

const sportTypeMapping: { [key: string]: string } = {
  Run: "Running",
  Bike: "Cycling",
  Swim: "Swimming",
};

const PersonalRecords: React.FC = () => {
  const [selectedSport, setSelectedSport] = useState<string | null>(null);

  const mappedSportType = selectedSport ? sportTypeMapping[selectedSport] : null;

  const { loading, error, data } = useQuery(GET_PERSONAL_RECORDS, {
    variables: { sport_type: mappedSportType },
    skip: !mappedSportType,
  });

  const handleSportSelection = useCallback((sport: string) => {
    setSelectedSport(sport);
  }, []);

  return (
    <div className="personal-records">
      <h1>Personal Records</h1>
      <div className="sport-buttons">
        {["Swim", "Run", "Bike"].map((sport) => (
          <button
            key={sport}
            className={`sport-button ${selectedSport === sport ? 'active' : ''}`}
            onClick={() => handleSportSelection(sport)}
            disabled={loading}
          >
            {sport}
          </button>
        ))}
      </div>

      {selectedSport && (
        <div className="records-list">
          <h2>{sportTypeMapping[selectedSport]} Records</h2>
          {loading && <p>Loading...</p>}
          {error && <p style={{ color: 'red' }}>Error fetching records. Please try again.</p>}
          
          {data?.personalRecords && data.personalRecords.length > 0 ? (
            <ul>
              {distances[sportTypeMapping[selectedSport] as keyof typeof distances].map((dist) => {
                const matchingRecords = data.personalRecords.filter((r: any) => r.distance === dist);

                return (
                  <li key={dist}>
                    {dist}m - 
                    {matchingRecords.length > 0
                      ? matchingRecords.map((r: any) => (
                          <span key={r.id}> {formatTime(parseInt(r.best_time, 10))}</span>
                        ))
                      : " No data"}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p>No personal records found for {sportTypeMapping[selectedSport]}.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default PersonalRecords;
