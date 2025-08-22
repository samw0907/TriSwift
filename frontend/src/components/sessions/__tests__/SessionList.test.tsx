import React from "react";
import { render, screen, fireEvent, within, waitFor } from "@testing-library/react";
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
        <SessionList
          sessions={mockSessions}
          onDelete={mockDelete}
          onUpdate={mockUpdate}
          onAddSession={() => {}}
        />
      </MockedProvider>
    );

    expect(screen.getByText("Run")).toBeInTheDocument();
    expect(screen.getByText("Bike")).toBeInTheDocument();
  });

  test("shows an empty grid (no cards) when list is empty", () => {
    render(
      <MockedProvider>
        <SessionList
          sessions={[]}
          onDelete={mockDelete}
          onUpdate={mockUpdate}
          onAddSession={() => {}}
        />
      </MockedProvider>
    );

    expect(screen.queryAllByRole("heading", { level: 3 })).toHaveLength(0);
  });

  test("expands and collapses a session card by clicking the card", () => {
    const { container } = render(
      <MockedProvider>
        <SessionList
          sessions={mockSessions}
          onDelete={mockDelete}
          onUpdate={mockUpdate}
          onAddSession={() => {}}
        />
      </MockedProvider>
    );

    fireEvent.click(screen.getByText("Run"));
    expect(container.querySelector(".expanded-card")).toBeTruthy();

    const expandedCard = container.querySelector(".expanded-card") as HTMLElement;
    fireEvent.click(expandedCard);
    expect(container.querySelector(".expanded-card")).toBeFalsy();
  });

  test("calls onDelete when delete icon is clicked (after expanding)", async () => {
    const { container } = render(
      <MockedProvider>
        <SessionList
          sessions={mockSessions}
          onDelete={mockDelete}
          onUpdate={mockUpdate}
          onAddSession={() => {}}
        />
      </MockedProvider>
    );

    fireEvent.click(screen.getByText("Run"));

    const expanded = container.querySelector(".expanded-card") as HTMLElement;
    expect(expanded).toBeTruthy();

    const delBtn = within(expanded).getByTitle(/Delete Session/i);
    fireEvent.click(delBtn);

    await waitFor(() => expect(mockDelete).toHaveBeenCalledWith("1"));
  });

  test("opens the edit session form when pencil icon is clicked (after expanding)", async () => {
    const { container } = render(
      <MockedProvider mocks={[mockUpdateSession]} addTypename={false}>
        <SessionList
          sessions={mockSessions}
          onDelete={mockDelete}
          onUpdate={mockUpdate}
          onAddSession={() => {}}
        />
      </MockedProvider>
    );

    fireEvent.click(screen.getByText("Run"));

    const expanded = container.querySelector(".expanded-card") as HTMLElement;
    expect(expanded).toBeTruthy();

    const editBtn = within(expanded).getByTitle(/Edit Session/i);
    fireEvent.click(editBtn);

    await waitFor(() => {
      expect(expanded.querySelector("input, select, textarea")).toBeTruthy();
    });
  });

  test("filters sessions based on session type", () => {
    render(
      <MockedProvider>
        <SessionList
          sessions={mockSessions}
          onDelete={mockDelete}
          onUpdate={mockUpdate}
          onAddSession={() => {}}
        />
      </MockedProvider>
    );

    fireEvent.click(screen.getByText("Show Filters"));
    fireEvent.click(screen.getByRole("checkbox", { name: "Run" }));

    const sessionTitles = screen.getAllByRole("heading", { level: 3 });
    expect(sessionTitles).toHaveLength(1);
    expect(sessionTitles[0]).toHaveTextContent("Run");
  });

  test("sorts sessions by date via the select input", () => {
    render(
      <MockedProvider>
        <SessionList
          sessions={mockSessions}
          onDelete={mockDelete}
          onUpdate={mockUpdate}
          onAddSession={() => {}}
        />
      </MockedProvider>
    );

    fireEvent.click(screen.getByText("Show Filters"));

    const sortSelect = screen.getByDisplayValue("Date (Newest)") as HTMLSelectElement;

    fireEvent.change(sortSelect, { target: { value: "date-asc" } });
    let sessionTitles = screen.getAllByRole("heading", { level: 3 });
    expect(sessionTitles[0]).toHaveTextContent("Bike");
    expect(sessionTitles[1]).toHaveTextContent("Run");

    fireEvent.change(sortSelect, { target: { value: "date-desc" } });
    sessionTitles = screen.getAllByRole("heading", { level: 3 });
    expect(sessionTitles[0]).toHaveTextContent("Run");
    expect(sessionTitles[1]).toHaveTextContent("Bike");
  });
});
