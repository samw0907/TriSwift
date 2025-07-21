import React, { useEffect, useState } from "react";
import { useQuery } from "@apollo/client";
import { GET_SESSIONS } from "../graphql/queries";
import TotalsGraph from "../components/TotalsGraph";
import { getCityComparison } from "../utils/cityDistanceLookup";
import "../styles/home.css";

const Home = () => {
  const { data, loading, error } = useQuery(GET_SESSIONS);
  const [last7Days, setLast7Days] = useState({ Swim: 0, Bike: 0, Run: 0 });
  const [last28Days, setLast28Days] = useState({ Swim: 0, Bike: 0, Run: 0 });
  const [yearToDate, setYearToDate] = useState({ Swim: 0, Bike: 0, Run: 0 });
  const [lifetime, setLifetime] = useState({ Swim: 0, Bike: 0, Run: 0 });

  useEffect(() => {
    if (!data?.sessions) return;
    const now = new Date();
    const startYear = new Date(now.getFullYear(), 0, 1);
    const buckets = {
      last7: { Swim: 0, Bike: 0, Run: 0 },
      last28: { Swim: 0, Bike: 0, Run: 0 },
      ytd: { Swim: 0, Bike: 0, Run: 0 },
      life: { Swim: 0, Bike: 0, Run: 0 }
    };
    data.sessions.forEach((s: any) => {
      const d = new Date(s.date);
      const days = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
      s.activities.forEach((a: any) => {
        const sport = a.sportType as "Swim" | "Bike" | "Run";
        const dist = sport === "Swim" ? a.distance * 1000 : a.distance;
        buckets.life[sport] += dist;
        if (d >= startYear) buckets.ytd[sport] += dist;
        if (days <= 28) buckets.last28[sport] += dist;
        if (days <= 7) buckets.last7[sport] += dist;
      });
    });
    setLast7Days(buckets.last7);
    setLast28Days(buckets.last28);
    setYearToDate(buckets.ytd);
    setLifetime(buckets.life);
  }, [data]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading data</p>;

  const totalYTDkm = yearToDate.Swim / 1000 + yearToDate.Bike + yearToDate.Run;
  const citySentence = getCityComparison(totalYTDkm);

  return (
    <div className="home">
      <h1 className="home-title">Your Training Overview</h1>
      <div className="home-summary-block">
        <p className="home-summary">
          So far this year you’ve covered <strong>{totalYTDkm.toFixed(1)} km</strong> across all
          sports.
        </p>
        {citySentence && (
          <p
            className="home-summary city-sentence"
            dangerouslySetInnerHTML={{ __html: citySentence }}
          ></p>
        )}
      </div>
      <div className="counters">
        <div className="counter-wrapper">
          <h2>Week</h2>
          <div className="counter-section">
            <p>Swim: {last7Days.Swim.toFixed(0)} m</p>
            <p>Bike: {last7Days.Bike.toFixed(1)} km</p>
            <p>Run: {last7Days.Run.toFixed(1)} km</p>
          </div>
        </div>
        <div className="counter-wrapper">
          <h2>Month</h2>
          <div className="counter-section">
            <p>Swim: {last28Days.Swim.toFixed(0)} m</p>
            <p>Bike: {last28Days.Bike.toFixed(1)} km</p>
            <p>Run: {last28Days.Run.toFixed(1)} km</p>
          </div>
        </div>
        <div className="counter-wrapper">
          <h2>Year-to-Date</h2>
          <div className="counter-section">
            <p>Swim: {yearToDate.Swim.toFixed(0)} m</p>
            <p>Bike: {yearToDate.Bike.toFixed(1)} km</p>
            <p>Run: {yearToDate.Run.toFixed(1)} km</p>
          </div>
        </div>
        <div className="counter-wrapper">
          <h2>Lifetime</h2>
          <div className="counter-section">
            <p>Swim: {lifetime.Swim.toFixed(0)} m</p>
            <p>Bike: {lifetime.Bike.toFixed(1)} km</p>
            <p>Run: {lifetime.Run.toFixed(1)} km</p>
          </div>
        </div>
      </div>
      <div className="graph-section">
        <TotalsGraph />
      </div>
    </div>
  );
};

export default Home;
