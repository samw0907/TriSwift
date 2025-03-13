import React, { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import { useQuery } from "@apollo/client";
import { GET_SESSIONS } from "../graphql/queries";
import TotalsGraph from "../components/TotalsGraph"; 
import '../index.css'
import '../styles/home.css'


const Home = () => {
  const token = localStorage.getItem('token');
  const { data, loading, error } = useQuery(GET_SESSIONS);

  const [last7DaysTotals, setLast7DaysTotals] = useState({ Swim: 0, Bike: 0, Run: 0 });
  const [last28DaysTotals, setLast28DaysTotals] = useState({ Swim: 0, Bike: 0, Run: 0 });
  const [yearToDateTotals, setYearToDateTotals] = useState({ Swim: 0, Bike: 0, Run: 0 });
  const [lifetimeTotals, setLifetimeTotals] = useState({ Swim: 0, Bike: 0, Run: 0 });

  useEffect(() => {
    if (data?.sessions) {
      const now = new Date();
      const startOfYear = new Date(now.getFullYear(), 0, 1);

      const totals7Days = { Swim: 0, Bike: 0, Run: 0 };
      const totals28Days = { Swim: 0, Bike: 0, Run: 0 };
      const totalsYTD = { Swim: 0, Bike: 0, Run: 0 };
      const totalsLifetime = { Swim: 0, Bike: 0, Run: 0 };

      data.sessions.forEach((session: any) => {
        const sessionDate = new Date(session.date);
        const daysDiff = (now.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24);

        session.activities.forEach((activity: any) => {
          const sportType = activity.sportType as "Swim" | "Bike" | "Run";
          const distance = sportType === "Swim" ? activity.distance * 1000 : activity.distance;

          if (sportType in totalsLifetime) {
            totalsLifetime[sportType] += distance;
            if (sessionDate >= startOfYear) {
              totalsYTD[sportType] += distance;
            }
            if (daysDiff <= 28) {
              totals28Days[sportType] += distance;
            }
            if (daysDiff <= 7) {
              totals7Days[sportType] += distance;
            }
          }
        });
      });

      setLast7DaysTotals(totals7Days);
      setLast28DaysTotals(totals28Days);
      setYearToDateTotals(totalsYTD);
      setLifetimeTotals(totalsLifetime);
    }
  }, [data]);


  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading data</p>;

  return (
    <div  className="home">
      <h1>Welcome to TriSwift</h1>
      <p>Track your fitness progress with ease.</p>

      <div className="counters">
        <div className="counter-wrapper">
          <h2>Distance in the Last 7 Days</h2>
          <div className="counter-section">
            <p>Swim: {last7DaysTotals.Swim.toFixed(0)} m</p>
            <p>Bike: {last7DaysTotals.Bike.toFixed(2)} km</p>
            <p>Run: {last7DaysTotals.Run.toFixed(2)} km</p>
          </div>
        </div>

        <div className="counter-wrapper">
          <h2>Distance in the Last 28 Days</h2>
          <div className="counter-section">
            <p>Swim: {last28DaysTotals.Swim.toFixed(0)} m</p>
            <p>Bike: {last28DaysTotals.Bike.toFixed(2)} km</p>
            <p>Run: {last28DaysTotals.Run.toFixed(2)} km</p>
          </div>
        </div>

        <div className="counter-wrapper">
          <h2>Year-to-Date Distance</h2>
          <div className="counter-section">
            <p>Swim: {yearToDateTotals.Swim.toFixed(0)} m</p>
            <p>Bike: {yearToDateTotals.Bike.toFixed(2)} km</p>
            <p>Run: {yearToDateTotals.Run.toFixed(2)} km</p>
          </div>
        </div>

        <div className="counter-wrapper">
          <h2>Lifetime Total Distance</h2>
          <div className="counter-section">
            <p>Swim: {lifetimeTotals.Swim.toFixed(0)} m</p>
            <p>Bike: {lifetimeTotals.Bike.toFixed(2)} km</p>
            <p>Run: {lifetimeTotals.Run.toFixed(2)} km</p>
          </div>
        </div>
      </div> 

        {!loading && !error && <TotalsGraph />}
    </div>
  );
};

export default Home;
