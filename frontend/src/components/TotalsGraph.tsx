import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import { useQuery } from "@apollo/client";
import { GET_SESSIONS } from "../graphql/queries";

Chart.register(...registerables);

const TotalsGraph: React.FC = () => {
  const { data, loading, error } = useQuery(GET_SESSIONS);
  const [selectedSport, setSelectedSport] = useState<"Run" | "Bike" | "Swim">("Run");
  const [viewMode, setViewMode] = useState<"weekly" | "monthly">("weekly");
  const [graphData, setGraphData] = useState<{ date: string; distance: number }[]>([]);


  useEffect(() => {
    if (data?.sessions) {
      const now = new Date();
      const daysCount = viewMode === "weekly" ? 7 : 28;
      const lastNDays: { [key: string]: number } = {};

      for (let i = daysCount - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(now.getDate() - i);
        lastNDays[date.toISOString().split("T")[0]] = 0;
      }

      data.sessions.forEach((session: any) => {
        const sessionDate = new Date(session.date).toISOString().split("T")[0];

        if (sessionDate in lastNDays) {
          session.activities.forEach((activity: any) => {
            if (activity.sportType === selectedSport) {
              const distance = selectedSport === "Swim" ? activity.distance * 1000 : activity.distance;
              lastNDays[sessionDate] += distance;
            }
          });
        }
      })

      const formattedData = Object.keys(lastNDays).map((date) => ({
        date,
        distance: lastNDays[date],
      }));

      setGraphData(formattedData);
    }
  }, [data, selectedSport, viewMode]);

  if (loading) return <p>Loading graph...</p>;
  if (error) return <p>Error loading data</p>;

  const maxDistance = Math.max(5, ...graphData.map((d) => d.distance));

  const chartData = {
    labels: graphData.map((d) => new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "2-digit" })),
    datasets: [
      {
        label: `Total Distance (${selectedSport}) - ${viewMode === "weekly" ? "Last 7 Days" : "Last 28 Days"}`,
        data: graphData.map((d) => d.distance),
        borderColor: "blue",
        backgroundColor: "rgba(0, 0, 255, 0.2)",
        borderWidth: 2,
        fill: true,
      },
    ],
  };

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
     <h2>{viewMode === "weekly" ? "Last 7 Days Distance" : "Last 28 Days Distance"}</h2>
      <div>
        <button onClick={() => setSelectedSport("Run")}>Run</button>
        <button onClick={() => setSelectedSport("Bike")}>Bike</button>
        <button onClick={() => setSelectedSport("Swim")}>Swim</button>
      </div>
      <div style={{ margin: "10px 0" }}>
        <button onClick={() => setViewMode("weekly")} disabled={viewMode === "weekly"}>
          Weekly
        </button>
        <button onClick={() => setViewMode("monthly")} disabled={viewMode === "monthly"}>
          Monthly
        </button>
      </div>
      <div style={{ width: "80%", margin: "auto" }}>
      <Line
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                suggestedMax: maxDistance + 5,
                title: {
                    display: true,
                    text: selectedSport === "Swim" ? "Distance (m)" : "Distance (km)",
              },
            },
          },
        }}
        />
      </div>
    </div>
  );
};

export default TotalsGraph;
