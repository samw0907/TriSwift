import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import { useQuery } from "@apollo/client";
import { GET_SESSIONS } from "../graphql/queries";

Chart.register(...registerables);

const TotalsGraph: React.FC = () => {
  const { data, loading, error } = useQuery(GET_SESSIONS);
  const [selectedSport, setSelectedSport] = useState<"Run" | "Bike" | "Swim">("Run");
  const [weeklyData, setWeeklyData] = useState<{ date: string; distance: number }[]>([]);

  useEffect(() => {
    if (data?.sessions) {
      const now = new Date();
      const last7Days: { [key: string]: number } = {};

      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(now.getDate() - i);
        last7Days[date.toISOString().split("T")[0]] = 0;
      }

      data.sessions.forEach((session: any) => {
        const sessionDate = new Date(session.date).toISOString().split("T")[0];

        if (sessionDate in last7Days) {
          session.activities.forEach((activity: any) => {
            if (activity.sportType === selectedSport) {
              const distance = selectedSport === "Swim" ? activity.distance * 1000 : activity.distance;
              last7Days[sessionDate] += distance;
            }
          });
        }
      })

      const formattedData = Object.keys(last7Days).map((date) => ({
        date,
        distance: last7Days[date],
      }));

      setWeeklyData(formattedData);
    }
  }, [data, selectedSport]);

  if (loading) return <p>Loading graph...</p>;
  if (error) return <p>Error loading data</p>;

  const maxDistance = Math.max(5, ...weeklyData.map((d) => d.distance));

  const graphData = {
    labels: weeklyData.map((d) => d.date),
    datasets: [
      {
        label: `Total Distance (${selectedSport})`,
        data: weeklyData.map((d) => d.distance),
        borderColor: "blue",
        backgroundColor: "rgba(0, 0, 255, 0.2)",
        borderWidth: 2,
        fill: true,
      },
    ],
  };

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <h2>Last 7 Days Distance</h2>
      <div>
        <button onClick={() => setSelectedSport("Run")}>Run</button>
        <button onClick={() => setSelectedSport("Bike")}>Bike</button>
        <button onClick={() => setSelectedSport("Swim")}>Swim</button>
      </div>
      <div style={{ width: "80%", margin: "auto" }}>
      <Line
          data={graphData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                suggestedMax: maxDistance + 5,
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default TotalsGraph;
