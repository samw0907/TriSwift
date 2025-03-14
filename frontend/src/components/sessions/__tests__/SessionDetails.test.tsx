import React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { vi } from "vitest";
import { MockedProvider } from "@apollo/client/testing";
import SessionDetails from "../SessionDetails";
import { formatDuration } from "../../../utils/format";
import { getNextActivity } from "../../../utils/sessionHelpers";
import { UPDATE_SESSION_ACTIVITY } from "../../../graphql/mutations";

// Mock utility functions
vi.mock("../../../utils/format", () => ({
  formatDuration: vi.fn((duration) => `${duration} sec`),
}));

vi.mock("../../../utils/sessionHelpers", () => ({
  getNextActivity: vi.fn(() => ({ transition: null, nextActivity: null })),
}));

const mockSession = {
  weatherTemp: 22,
  weatherHumidity: 50,
  weatherWindSpeed: 5,
  activities: [
    {
      id: "a1",
      sportType: "Run",
      duration: 1800, // 30 min
      distance: 5,
      heartRateMin: 100,
      heartRateMax: 170,
      heartRateAvg: 140,
      cadence: 85,
      power: 200,
    },
  ],
  transitions: [
    {
      id: "t1",
      previousSport: "Swim",
      nextSport: "Bike",
      transitionTime: 120,
      comments: "Quick change",
    },
  ],
};

const mockUpdate = vi.fn();

const mockUpdateActivity = {
  request: {
    query: UPDATE_SESSION_ACTIVITY,
    variables: { id: "a1", duration: 1900 },
  },
  result: {
    data: {
      updateActivity: {
        id: "a1",
        duration: 1900,
      },
    },
  },
};

describe("SessionDetails Component", () => {
  test("renders weather details if available", () => {
    render(<SessionDetails session={mockSession} onUpdate={mockUpdate} />);

    expect(screen.getByText("Temp - 22°C")).toBeInTheDocument();
    expect(screen.getByText("Humidity - 50%")).toBeInTheDocument();
    expect(screen.getByText("Wind Speed - 5m/s")).toBeInTheDocument();
  });

  test("renders activity details", () => {
    render(<SessionDetails session={mockSession} onUpdate={mockUpdate} />);

    expect(screen.getByText("Run")).toBeInTheDocument();
    expect(screen.getByText("Distance: 5.00 km")).toBeInTheDocument();
    expect(screen.getByText("Duration: 1800 sec")).toBeInTheDocument();
    expect(screen.getByText("HR Min: 100 bpm")).toBeInTheDocument();
    expect(screen.getByText("HR Max: 170 bpm")).toBeInTheDocument();
    expect(screen.getByText("Avg HR: 140 bpm")).toBeInTheDocument();
    expect(screen.getByText("Cadence: 85 rpm")).toBeInTheDocument();
    expect(screen.getByText("Power: 200 watts")).toBeInTheDocument();
  });

  test("renders transition details", () => {
    render(<SessionDetails session={mockSession} onUpdate={mockUpdate} />);

    // Debug the DOM to check how "Transition:" is structured
    screen.debug();

    expect(
      screen.getByText((content) => content.includes("Transition:"))
    ).toBeInTheDocument();

    expect(
      screen.getByText((content) => content.includes("Swim → Bike"))
    ).toBeInTheDocument();

    expect(
      screen.getByText((content) => content.includes("Transition Time: 120 sec"))
    ).toBeInTheDocument();

    expect(
      screen.getByText((content) => content.includes("Notes: Quick change"))
    ).toBeInTheDocument();
  });

  test("shows and hides edit form when clicking edit button", async () => {
    render(
      <MockedProvider mocks={[mockUpdateActivity]} addTypename={false}>
        <SessionDetails session={mockSession} onUpdate={mockUpdate} />
      </MockedProvider>
    );

    // Click "Edit Activity"
    fireEvent.click(screen.getByText("Edit Activity"));

    // Ensure the edit form is shown
    expect(await screen.findByText("Cancel")).toBeInTheDocument();

    // Find the cancel button inside the edit form
    const editForm = screen.getByRole("form");
    const cancelButtons = within(editForm).getAllByText("Cancel");

    // Ensure there is exactly **one** cancel button inside the form
    expect(cancelButtons.length).toBeGreaterThan(0);

    // Click cancel and check if form is closed
    fireEvent.click(cancelButtons[0]);
    expect(screen.getByText("Edit Activity")).toBeInTheDocument();
  });

  test("does not display weather details when null", () => {
    render(
      <SessionDetails
        session={{
          ...mockSession,
          weatherTemp: null,
          weatherHumidity: null,
          weatherWindSpeed: null,
        }}
        onUpdate={mockUpdate}
      />
    );

    expect(screen.queryByText(/Temp -/)).toBeNull();
    expect(screen.queryByText(/Humidity -/)).toBeNull();
    expect(screen.queryByText(/Wind Speed -/)).toBeNull();
  });
});
