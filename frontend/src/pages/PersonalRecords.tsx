import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_PERSONAL_RECORDS } from '../graphql/queries';

const distances = {
  Swim: [100, 200, 400, 800, 1000, 1500, 2000],
  Run: [100, 200, 400, 1000, 5000, 10000, 21100, 42200],
  Bike: [10000, 20000, 40000, 50000, 80000, 100000, 150000, 200000],
};

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${minutes}:${sec < 10 ? '0' : ''}${sec}`;
};

const PersonalRecords = () => {
  const [selectedSport, setSelectedSport] = useState<string | null>(null);

  const { loading, error, data } = useQuery(GET_PERSONAL_RECORDS, {
    variables: { sportType: selectedSport },
    skip: !selectedSport,
  });

  return (
    <div className="personal-records">
      <h1>Personal Records</h1>
      <div className="sport-buttons">
        {["Swim", "Run", "Bike"].map((sport) => (
          <button
            key={sport}
            className={`sport-button ${selectedSport === sport ? 'active' : ''}`}
            onClick={() => setSelectedSport(sport)}
          >
            {sport}
          </button>
        ))}
      </div>

      {selectedSport && (
        <div className="records-list">
          <h2>{selectedSport} Records</h2>
          {loading && <p>Loading...</p>}
          {error && <p>Error fetching records.</p>}
          {data && (
            <ul>
              {distances[selectedSport as keyof typeof distances].map((dist) => (
                <li key={dist}>
                  {dist}m - 
                  {data.personalRecords.find((r: any) => r.distance === dist)
                    ? data.personalRecords.find((r: any) => r.distance === dist).bestTimes.map((time: number, index: number) => (
                        <span key={index}> {formatTime(time)}</span>
                      ))
                    : " No data"}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default PersonalRecords;
