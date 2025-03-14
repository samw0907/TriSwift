import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import { MockedProvider } from "@apollo/client/testing";
import SessionList from "../SessionList";
import { UPDATE_SESSION } from "../../../graphql/mutations";

const mockSessions = [
  {
    id: "1",
    sessionType: "Run",
    date: "2024-03-01",
    activities: [{ id: "a1", sportType: "Run", distance: 5, duration: 30 }],
    transitions: [],
  },
  {
    id: "2",
    sessionType: "Bike",
    date: "2024-02-28",
    activities: [{ id: "a2", sportType: "Bike", distance: 20, duration: 60 }],
    transitions: [],
  },
];

const mockDelete = vi.fn();
const mockUpdate = vi.fn();

const mockUpdateSession = {
  request: {
    query: UPDATE_SESSION,
    variables: { id: "1", sessionType: "Run" },
  },
  result: {
    data: { updateSession: { id: "1", sessionType: "Run" } },
  },
};

describe("SessionList Component", () => {
  test("renders session list with sessions", () => {
    render(
      <MockedProvider>
        <SessionList sessions={mockSessions} onDelete={mockDelete} onUpdate={mockUpdate} />
      </MockedProvider>
    );

    expect(screen.getByText("Run")).toBeInTheDocument();
    expect(screen.getByText("Bike")).toBeInTheDocument();
  });

  test("shows 'No sessions available' when empty", () => {
    render(
      <MockedProvider>
        <SessionList sessions={[]} onDelete={mockDelete} onUpdate={mockUpdate} />
      </MockedProvider>
    );

    expect(screen.getAllByText(/No sessions available/i).length).toBeGreaterThan(0);
  });

  test("toggles session details when 'Show Details' is clicked", () => {
    render(
      <MockedProvider>
        <SessionList sessions={mockSessions} onDelete={mockDelete} onUpdate={mockUpdate} />
      </MockedProvider>
    );

    const detailsButtons = screen.getAllByText("Show Details");
    fireEvent.click(detailsButtons[0]);

    expect(screen.getByText("Hide Details")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Hide Details"));
    expect(screen.getAllByText("Show Details").length).toBeGreaterThan(0);
  });

  test("calls onDelete when delete button is clicked", () => {
    render(
      <MockedProvider>
        <SessionList sessions={mockSessions} onDelete={mockDelete} onUpdate={mockUpdate} />
      </MockedProvider>
    );

    fireEvent.click(screen.getAllByText("Delete")[0]);
    expect(mockDelete).toHaveBeenCalledWith("1");
  });

  test("opens the edit session form when edit button is clicked", async () => {
    render(
      <MockedProvider mocks={[mockUpdateSession]} addTypename={false}>
        <SessionList sessions={mockSessions} onDelete={mockDelete} onUpdate={mockUpdate} />
      </MockedProvider>
    );

    fireEvent.click(screen.getAllByText("Edit")[0]);
    expect(await screen.findByText(/Edit Session/i)).toBeInTheDocument();
  });

  test("filters sessions based on session type", () => {
    render(
      <MockedProvider>
        <SessionList sessions={mockSessions} onDelete={mockDelete} onUpdate={mockUpdate} />
      </MockedProvider>
    );

    fireEvent.click(screen.getByText("Show Filters"));
    fireEvent.click(screen.getByLabelText("Run"));

    // Ensure only "Run" session remains (but checkbox for "Bike" exists)
    const sessionTitles = screen.getAllByRole("heading", { level: 3 });
    expect(sessionTitles).toHaveLength(1);
    expect(sessionTitles[0]).toHaveTextContent("Run");
  });

  test("sorts sessions by most recent date", () => {
    render(
      <MockedProvider>
        <SessionList sessions={mockSessions} onDelete={mockDelete} onUpdate={mockUpdate} />
      </MockedProvider>
    );

    fireEvent.click(screen.getByText("Show Filters"));
    fireEvent.click(screen.getByText("Most Recent"));

    const sessionTitles = screen.getAllByRole("heading", { level: 3 });
    expect(sessionTitles[0]).toHaveTextContent("Run");
    expect(sessionTitles[1]).toHaveTextContent("Bike");
  });
});
