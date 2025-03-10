import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import { useQuery } from "@apollo/client";
import { GET_SESSIONS } from "../graphql/queries";

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

          const year = startOfWeek.getFullYear();
          const weekNumber = Math.ceil(((startOfWeek.getTime() - new Date(year, 0, 1).getTime()) / (1000 * 60 * 60 * 24)) / 7);
          const weekLabel = `${year}-W${weekNumber.toString().padStart(2, "0")}`;

          dateMap[weekLabel] = 0;
        }
      } else {
        const timeRange = viewMode === "Monthly" ? 28 : 7;
          for (let i = timeRange - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(now.getDate() - i);
            dateMap[date.toISOString().split("T")[0]] = 0;
          }
      }

      data.sessions.forEach((session: any) => {
        const sessionDateObj = new Date(session.date);
        let label = sessionDateObj.toISOString().split("T")[0];

        if (viewMode === "Yearly") {
          const year = sessionDateObj.getFullYear();
          const weekNumber = Math.ceil(((sessionDateObj.getTime() - new Date(year, 0, 1).getTime()) / (1000 * 60 * 60 * 24)) / 7);
          label = `${year}-W${weekNumber.toString().padStart(2, "0")}`;
        }
  
        if (label in dateMap) {
          session.activities.forEach((activity: any) => {
            if (activity.sportType === selectedSport) {
              const distance = selectedSport === "Swim" ? activity.distance * 1000 : activity.distance;
              dateMap[label] += distance;
            }
          });
        }
      })

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
        return new Date(d.date).toLocaleDateString("default", { month: "short", day: "numeric" });
      }),
    datasets: [
      {
        label: `Total Distance (${selectedSport})`,
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
      <h2>
        {viewMode === "Weekly" ? "Last 7 Days Distance" : viewMode === "Monthly" ? "Past Month Distance": "Past Year Distance"}
      </h2>
      <div>
        <button onClick={() => setSelectedSport("Run")}>Run</button>
        <button onClick={() => setSelectedSport("Bike")}>Bike</button>
        <button onClick={() => setSelectedSport("Swim")}>Swim</button>
      </div>
      <div style={{ margin: "10px 0" }}>
        <button onClick={() => setViewMode("Weekly")}>
          Weekly
        </button>
        <button onClick={() => setViewMode("Monthly")}>
          Monthly
        </button>
        <button onClick={() => setViewMode("Yearly")}>
            Yearly
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
