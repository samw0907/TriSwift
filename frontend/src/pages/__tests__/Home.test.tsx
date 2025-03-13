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
          date: "2025-03-10",
          activities: [
            { sportType: "Run", distance: 5 },
            { sportType: "Bike", distance: 20 },
          ],
        },
        {
          date: "2025-03-11",
          activities: [
            { sportType: "Run", distance: 10 },
            { sportType: "Swim", distance: 2 },
          ],
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

  expect(screen.getByText(/Welcome to TriSwift/i)).toBeInTheDocument();
  expect(screen.getByText(/Track your fitness progress with ease./i)).toBeInTheDocument();
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
    expect(screen.getByText(/Distance in the Last 7 Days/i)).toBeInTheDocument();
    expect(screen.getByText(/Distance in the Last 28 Days/i)).toBeInTheDocument();
    expect(screen.getByText(/Year-to-Date Distance/i)).toBeInTheDocument();
    expect(screen.getByText(/Lifetime Total Distance/i)).toBeInTheDocument();
  });
});
