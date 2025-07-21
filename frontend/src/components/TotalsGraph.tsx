import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import { useQuery } from "@apollo/client";
import { GET_SESSIONS } from "../graphql/queries";
import "../index.css";
import "../styles/totalsGraph.css";

Chart.register(...registerables);

const TotalsGraph: React.FC = () => {
  const { data, loading, error } = useQuery(GET_SESSIONS);
  const [selectedSport, setSelectedSport] = useState<"Run" | "Bike" | "Swim">("Run");
  const [viewMode, setViewMode] = useState<"Weekly" | "Monthly" | "Yearly">("Weekly");
  const [graphData, setGraphData] = useState<{ date: string; distance: number }[]>([]);

  useEffect(() => {
    if (data?.sessions) {
      const now = new Date();
      const dateMap: { [key: string]: number } = {};

      if (viewMode === "Yearly") {
        for (let i = 52; i >= 0; i--) {
          const startOfWeek = new Date();
          startOfWeek.setDate(now.getDate() - i * 7);

          const weekStart = new Date(startOfWeek);
          weekStart.setDate(startOfWeek.getDate() - startOfWeek.getDay());

          const weekLabel = `${weekStart.toISOString().split("T")[0]}`;
          dateMap[weekLabel] = 0;
        }

        data.sessions.forEach((session: any) => {
          const sessionDateObj = new Date(session.date);
          const weekStart = new Date(sessionDateObj);
          weekStart.setDate(sessionDateObj.getDate() - sessionDateObj.getDay());
          const weekLabel = weekStart.toISOString().split("T")[0];

          if (weekLabel in dateMap) {
            session.activities.forEach((activity: any) => {
              if (activity.sportType === selectedSport) {
                const distance =
                  selectedSport === "Swim"
                    ? activity.distance * 1000
                    : activity.distance;
                dateMap[weekLabel] += distance;
              }
            });
          }
        });
      } else {
        const timeRange = viewMode === "Monthly" ? 28 : 7;
        for (let i = timeRange - 1; i >= 0; i--) {
          const date = new Date();
          date.setDate(now.getDate() - i);
          dateMap[date.toISOString().split("T")[0]] = 0;
        }

        data.sessions.forEach((session: any) => {
          const sessionDateObj = new Date(session.date);
          const label = sessionDateObj.toISOString().split("T")[0];

          if (label in dateMap) {
            session.activities.forEach((activity: any) => {
              if (activity.sportType === selectedSport) {
                const distance =
                  selectedSport === "Swim"
                    ? activity.distance * 1000
                    : activity.distance;
                dateMap[label] += distance;
              }
            });
          }
        });
      }

      const formattedData = Object.keys(dateMap).map((date) => ({
        date,
        distance: dateMap[date],
      }));

      setGraphData(formattedData);
    }
  }, [data, selectedSport, viewMode]);

  if (loading) return <p>Loading graph...</p>;
  if (error) return <p>Error loading data</p>;

  const maxDistance = Math.max(5, ...graphData.map((d) => d.distance));

  const chartData = {
    labels: graphData.map((d) => {
      if (viewMode === "Yearly") {
        return d.date;
      }
      return new Date(d.date).toLocaleDateString("default", {
        month: "short",
        day: "numeric",
      });
    }),
    datasets: [
      {
        label: `Total Distance (${selectedSport})`,
        data: graphData.map((d) => d.distance),
        borderColor: "#fb8122",
        backgroundColor: "rgba(251, 129, 34, 0.15)",
        borderWidth: 3,
        pointBackgroundColor: "#00bfff",
        pointBorderColor: "#1d2228",
        pointRadius: 5,
        fill: true,
      },
    ],
  };

  return (
    <div className="totals-graph-container">
      <h2>
        {viewMode === "Weekly"
          ? "Last 7 Days Distance"
          : viewMode === "Monthly"
          ? "Past Month Distance"
          : "Past Year Distance"}
      </h2>
      <div className="sport-buttons">
        <button
          className={selectedSport === "Run" ? "active" : ""}
          onClick={() => setSelectedSport("Run")}
        >
          Run
        </button>
        <button
          className={selectedSport === "Bike" ? "active" : ""}
          onClick={() => setSelectedSport("Bike")}
        >
          Bike
        </button>
        <button
          className={selectedSport === "Swim" ? "active" : ""}
          onClick={() => setSelectedSport("Swim")}
        >
          Swim
        </button>
      </div>

      <div className="view-buttons">
        <button
          className={viewMode === "Weekly" ? "active" : ""}
          onClick={() => setViewMode("Weekly")}
        >
          Weekly
        </button>
        <button
          className={viewMode === "Monthly" ? "active" : ""}
          onClick={() => setViewMode("Monthly")}
        >
          Monthly
        </button>
        <button
          className={viewMode === "Yearly" ? "active" : ""}
          onClick={() => setViewMode("Yearly")}
        >
          Yearly
        </button>
      </div>

      <div className="graph-container">
        <Line
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                labels: {
                  color: "#ffffff"
                }
              }
            },
            scales: {
              x: {
                ticks: {
                  color: "#ffffff"
                },
                grid: {
                  color: "rgba(255,255,255,0.1)"
                }
              },
              y: {
                beginAtZero: true,
                suggestedMax: maxDistance + 5,
                ticks: {
                  color: "#ffffff"
                },
                title: {
                  display: true,
                  text: selectedSport === "Swim" ? "Distance (m)" : "Distance (km)",
                  color: "#ffffff"
                },
                grid: {
                  color: "rgba(255,255,255,0.1)"
                }
              }
            }
          }}
        />
      </div>
    </div>
  );
};

export default TotalsGraph;
