import React, { useState, useCallback } from 'react';
import { useQuery } from '@apollo/client';
import { GET_PERSONAL_RECORDS } from '../graphql/queries';

const distances = {
  Run: [0.1, 0.2, 0.4, 1, 5, 10, 21.1, 42.2],
  Bike: [10, 20, 40, 50, 80, 100, 150, 200],
  Swim: [0.1, 0.2, 0.4, 0.8, 1, 1.5, 2],
};

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${minutes}:${sec < 10 ? '0' : ''}${sec}`;
};

const sportTypeMapping: { [key: string]: string } = {
  Run: "Run",
  Bike: "Bike",
  Swim: "Swim",
};

const PersonalRecords: React.FC = () => {
  const [selectedSport, setSelectedSport] = useState<string | null>(null);

  const mappedSportType = selectedSport ? sportTypeMapping[selectedSport] : null;

  const { loading, error, data, refetch } = useQuery(GET_PERSONAL_RECORDS, {
    variables: { sportType: mappedSportType },
    skip: !mappedSportType,
  });
  
  const handleSportSelection = useCallback((sport: string) => {
    setSelectedSport(sport);
    if (refetch) {
      refetch({ sportType: sportTypeMapping[sport] });
    }
  }, [refetch]);

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
              {distances[selectedSport as keyof typeof distances].map((dist) => {
                const matchingRecords = data.personalRecords
                  .filter((r: any) => Number(r.distance) === Number(dist))
                  .sort((a: any, b: any) => Number(a.bestTime) - Number(b.bestTime))
                  .slice(0, 3);

                return (
                  <li key={dist}>
                    <strong>{selectedSport === "Swim" ? `${dist * 1000}m` : `${dist}km`}</strong> - 
                    {matchingRecords.length > 0 ? (
                      matchingRecords.map((r: any) => (
                        <span key={r.id}> 
                          {formatTime(Number(r.bestTime))} 
                        </span>
                      ))
                    ) : (
                      " No data"
                    )}
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
