import React, { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import { useQuery } from "@apollo/client";
import { GET_SESSIONS } from "../graphql/queries";
import "../styles/home.css";


const Home = () => {
  const token = localStorage.getItem('token');
  const { data, loading, error } = useQuery(GET_SESSIONS);
  const [last7DaysTotals, setLast7DaysTotals] = useState({
    Swim: 0,
    Bike: 0,
    Run: 0,
  });

  useEffect(() => {
    if (data?.sessions) {
      const now = new Date();

      const totals = { Swim: 0, Bike: 0, Run: 0 };

      data.sessions.forEach((session: any) => {
        const sessionDate = new Date(session.date);
        const daysDiff = (now.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24);

        if (daysDiff <= 7) {
          session.activities.forEach((activity: any) => {
            const sportType = activity.sportType as "Swim" | "Bike" | "Run";
            const distance = sportType === "Swim" ? activity.distance * 1000 : activity.distance;

            totals[sportType] += distance;
          });
        }
      });

      setLast7DaysTotals(totals);
    }
  }, [data]);


  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading data</p>;

  return (
    <div style={{ textAlign: 'center' }}>
      <h1>Welcome to TriSwift</h1>
      <p>Track your fitness progress with ease.</p>

      <div className="counters">
        <h2>Distance in the Last 7 Days</h2>
        <div className="counter-section">
          <p>Swim: {last7DaysTotals.Swim.toFixed(0)} m</p>
          <p>Bike: {last7DaysTotals.Bike.toFixed(2)} km</p>
          <p>Run: {last7DaysTotals.Run.toFixed(2)} km</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
