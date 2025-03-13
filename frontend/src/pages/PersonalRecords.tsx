import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { GET_PERSONAL_RECORDS } from '../graphql/queries';
import '../index.css'
import '../styles/personalRecords.css'

const distances = {
  Run: [0.1, 0.2, 0.4, 1, 5, 10, 21.1, 42.2],
  Bike: [10, 20, 40, 50, 80, 100, 150, 200],
  Swim: [0.1, 0.2, 0.4, 0.8, 1, 1.5, 2],
};

const formatTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const sec = seconds % 60;

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
};

const sportTypeMapping: { [key: string]: string } = {
  Run: "Run",
  Bike: "Bike",
  Swim: "Swim",
};

const PersonalRecords: React.FC = () => {
  const [selectedSport, setSelectedSport] = useState<string>("Swim");
  const mappedSportType = selectedSport ? sportTypeMapping[selectedSport] : null;

  const { loading, error, data, refetch } = useQuery(GET_PERSONAL_RECORDS, {
    variables: { sportType: mappedSportType },
    skip: !mappedSportType,
    fetchPolicy: "network-only",
  });

  const handleSportSelection = (sport: string) => {
    setSelectedSport(sport);
    setTimeout(() => refetch({ sportType: sportTypeMapping[sport] }), 0);
  };

  useEffect(() => {
    if (selectedSport) {
      refetch({ sportType: sportTypeMapping[selectedSport] });
    }
  }, [selectedSport, refetch]);
  

  return (
    <div className="personal-records">
      <h1>Personal Records</h1>
      <div className="sport-buttons">
        {["Swim", "Run", "Bike"].map((sport) => (
          <button
            key={sport}
            data-testid={`sport-button-${sport.toLowerCase()}`} 
            className={`sport-button ${selectedSport === sport ? 'active' : ''}`}
            onClick={() => handleSportSelection(sport)}
            disabled={loading}
          >
            {sport}
          </button>
        ))}
      </div>

      {selectedSport && (
        <div className="records-container">
          <h2>{sportTypeMapping[selectedSport]} Records</h2>
          {loading && <p>Loading...</p>}
          {error && <p style={{ color: 'red' }}>Error fetching records. Please try again.</p>}

          {data?.personalRecords && data.personalRecords.length > 0 ? (
            <table className="records-table" role="table">
              <thead>
                <tr>
                  <th>Distance</th>
                  <th>1st</th>
                  <th>2nd</th>
                  <th>3rd</th>
                </tr>
              </thead>
              <tbody>
                {distances[selectedSport as keyof typeof distances].map((dist) => {
                  let matchingRecords = data.personalRecords
                    .filter((r: any) => {
                      const storedDistance = selectedSport === "Swim" ? Number(r.distance) * 1000 : Number(r.distance);
                      const displayDistance = selectedSport === "Swim" ? dist * 1000 : dist;
                      return storedDistance === displayDistance;
                    })
                    .sort((a: any, b: any) => Number(a.bestTime) - Number(b.bestTime));

                  let recordTimes = Array.from(new Set(matchingRecords.map((r: { bestTime: number }) => r.bestTime)));

                  recordTimes = [...recordTimes, null, null].slice(0, 3);

                  return (
                    <tr key={dist}>
                      <td>{selectedSport === "Swim" ? `${dist * 1000}m` : `${dist}km`}</td>
                      {[0, 1, 2].map((index) => (
                        <td key={index}>
                          {recordTimes[index] ? formatTime(Number(recordTimes[index])) : "-"}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <p>No personal records found for {sportTypeMapping[selectedSport]}.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default PersonalRecords;
