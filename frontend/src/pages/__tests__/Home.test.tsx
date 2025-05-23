import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import Home from "../Home";
import { GET_SESSIONS } from "../../graphql/queries";

const mockData = {
    request: { query: GET_SESSIONS },
    result: {
      data: {
        sessions: [
          {
            id: "1",
            sessionType: "Single",
            date: "2025-03-10",
            isMultiSport: false,
            totalDuration: 90,
            totalDistance: 25,
            weatherTemp: 20,
            weatherHumidity: 50,
            weatherWindSpeed: 10,
            created_at: "2025-03-10T10:00:00Z",
            updated_at: "2025-03-10T10:00:00Z",
            activities: [
              {
                id: "101",
                sportType: "Run",
                duration: 30,
                distance: 5,
                heartRateMin: 120,
                heartRateMax: 180,
                heartRateAvg: 150,
                cadence: 80,
                power: null,
                created_at: "2025-03-10T10:30:00Z",
                updated_at: "2025-03-10T10:30:00Z",
              },
              {
                id: "102",
                sportType: "Bike",
                duration: 60,
                distance: 20,
                heartRateMin: 110,
                heartRateMax: 170,
                heartRateAvg: 140,
                cadence: 90,
                power: 250,
                created_at: "2025-03-10T11:30:00Z",
                updated_at: "2025-03-10T11:30:00Z",
              },
            ],
            transitions: [],
          },
        ],
      },
    },
  };

const renderWithMock = (mocks: any) => {
  return render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <Home />
    </MockedProvider>
  );
};

test("renders the welcome message", async () => {
    renderWithMock([mockData]);
  
    await waitFor(() => {
      expect(screen.getByText(/Welcome to TriSwift/i)).toBeInTheDocument();
      expect(screen.getByText(/Your all-in-one training companion for swimming, cycling, and running./i)).toBeInTheDocument();
    });
  });
  
  test("renders the loading state", async () => {
    renderWithMock([]);
  
    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
  });
  
  test("renders error message on query failure", async () => {
    const errorMock = {
      request: { query: GET_SESSIONS },
      error: new Error("GraphQL Error"),
    };
  
    renderWithMock([errorMock]);
  
    await waitFor(() => {
      expect(screen.getByText(/Error loading data/i)).toBeInTheDocument();
    });
  });
  
  test("renders counters for swim, bike, and run", async () => {
    renderWithMock([mockData]);
  
    await waitFor(() => {
      expect(screen.getByText(/Week Distance/i)).toBeInTheDocument();
      expect(screen.getByText(/Month Distance/i)).toBeInTheDocument();
      expect(screen.getByText(/Year-to-Date Distance/i)).toBeInTheDocument();
      expect(screen.getByText(/Lifetime Total Distance/i)).toBeInTheDocument();
    });
  });
  
