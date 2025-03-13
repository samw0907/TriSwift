import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import { vi } from "vitest";
import Dashboard from "../Dashboard";
import { GET_SESSIONS } from "../../graphql/queries";
import { DELETE_SESSION } from "../../graphql/mutations";

const mockSessions = {
  request: { query: GET_SESSIONS },
  result: {
    data: {
      sessions: [
        {
          id: "1",
          sessionType: "Run",
          date: "2025-03-10",
          totalDuration: 45,
          totalDistance: 10,
          weatherTemp: 18,
          weatherHumidity: 60,
          weatherWindSpeed: 12,
          created_at: "2025-03-10T10:00:00Z",
          updated_at: "2025-03-10T10:05:00Z",
          activities: [
            {
              id: "101",
              sportType: "Run",
              duration: 45,
              distance: 10,
              heartRateMin: 120,
              heartRateMax: 180,
              heartRateAvg: 150,
              cadence: 90,
              power: null,
              created_at: "2025-03-10T10:10:00Z",
              updated_at: "2025-03-10T10:15:00Z",
            },
          ],
          transitions: [],
        },
      ],
    },
  },
};

const deleteMock = {
  request: { query: DELETE_SESSION, variables: { id: "1" } },
  result: {
    data: {
      deleteSession: { id: "1" },
    },
  },
};

const emptySessionsAfterDelete = {
  request: { query: GET_SESSIONS },
  result: {
    data: { sessions: [] },
  },
};

const renderWithMock = (mocks: any) => {
  return render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <Dashboard />
    </MockedProvider>
  );
};

beforeAll(() => {
  vi.spyOn(window, "confirm").mockImplementation(() => true);
});

afterAll(() => {
  vi.restoreAllMocks();
});

test("renders the dashboard title", async () => {
  renderWithMock([mockSessions]);

  await waitFor(() => {
    expect(screen.getByText(/Session Dashboard/i)).toBeInTheDocument();
  });
});

test("renders loading state", async () => {
  renderWithMock([]);

  expect(screen.getByText(/Loading sessions.../i)).toBeInTheDocument();
});

test("renders error state", async () => {
  const errorMock = {
    request: { query: GET_SESSIONS },
    error: new Error("GraphQL Error"),
  };

  renderWithMock([errorMock]);

  await waitFor(() => {
    expect(screen.getByText(/Error fetching sessions/i)).toBeInTheDocument();
  });
});

test("renders session list", async () => {
  renderWithMock([mockSessions]);

  await waitFor(() => {
    expect(screen.getByText(/Past Sessions/i)).toBeInTheDocument();
    expect(screen.getByText(/Run/i)).toBeInTheDocument();
  });
});

test("can open and close the session form", async () => {
  renderWithMock([mockSessions]);

  await waitFor(() => {
    const addSessionButton = screen.getByText(/Add Session/i);
    fireEvent.click(addSessionButton);
    expect(screen.getByText(/Cancel/i)).toBeInTheDocument();

    const cancelButton = screen.getByText(/Cancel/i);
    fireEvent.click(cancelButton);
    expect(screen.queryByText(/Cancel/i)).not.toBeInTheDocument();
  });
});

test("allows deleting a session", async () => {
  renderWithMock([mockSessions, deleteMock, emptySessionsAfterDelete]);

  await waitFor(() => {
    expect(screen.getByText(/Past Sessions/i)).toBeInTheDocument();
    expect(screen.getByText(/Run/i)).toBeInTheDocument();
  });

  const deleteButton = screen.getByRole("button", { name: /delete/i });
  expect(deleteButton).toBeInTheDocument();
  fireEvent.click(deleteButton);

  await waitFor(() => {
    expect(screen.queryByText(/Run/i)).not.toBeInTheDocument();
  }, { timeout: 3000 });
});
