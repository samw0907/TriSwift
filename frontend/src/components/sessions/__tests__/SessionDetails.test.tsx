import React from "react";
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { MockedProvider } from "@apollo/client/testing";
import SessionDetails from "../SessionDetails";

vi.mock("../../../utils/format", () => ({
  formatDuration: vi.fn((duration: number) => `${duration} sec`),
}));

const baseSession = {
  id: "s1",
  sessionType: "Run",
  date: "2024-03-01",
  weatherTemp: 22,
  weatherHumidity: 50,
  weatherWindSpeed: 5,
  activities: [
    {
      id: "a1",
      sportType: "Run",
      duration: 1800,
      distance: 5,
      created_at: "2024-03-01T10:00:00Z",
      heartRateMin: 100,
      heartRateMax: 170,
      heartRateAvg: 140,
      cadence: 85,
      power: 200,
    },
  ],
  transitions: [],
};

const renderWith = (session = baseSession, mocks: any[] = []) => {
  const onUpdate = vi.fn();
  const onEditSession = vi.fn();
  const onDeleteSession = vi.fn();

  render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <SessionDetails
        session={session as any}
        onUpdate={onUpdate}
        onEditSession={onEditSession}
        onDeleteSession={onDeleteSession}
      />
    </MockedProvider>
  );

  return { onUpdate, onEditSession, onDeleteSession };
};

describe("SessionDetails", () => {
  test("renders weather details if available", () => {
    renderWith();

    expect(screen.getByText(/Weather/i)).toBeInTheDocument();
    expect(screen.getByText(/Temp/i)).toBeInTheDocument();
    expect(screen.getByText("22 °C")).toBeInTheDocument();
    expect(screen.getByText(/Humidity/i)).toBeInTheDocument();
    expect(screen.getByText("50 %")).toBeInTheDocument();
    expect(screen.getByText(/Wind/i)).toBeInTheDocument();
    expect(screen.getByText("5 m/s")).toBeInTheDocument();
  });

  test("renders single-activity details and stats", () => {
    renderWith();

    expect(screen.getByText("Run")).toBeInTheDocument();
    expect(screen.getByText("Distance")).toBeInTheDocument();
    expect(screen.getByText("5.00 km")).toBeInTheDocument();
    expect(screen.getByText("Time")).toBeInTheDocument();
    expect(screen.getByText("00:30:00")).toBeInTheDocument();

    expect(screen.getByText("Stats")).toBeInTheDocument();
    expect(screen.getByText("HR Max")).toBeInTheDocument();
    expect(screen.getByText("170 bpm")).toBeInTheDocument();
    expect(screen.getByText("HR Min")).toBeInTheDocument();
    expect(screen.getByText("100 bpm")).toBeInTheDocument();
    expect(screen.getByText("HR Average")).toBeInTheDocument();
    expect(screen.getByText("140 bpm")).toBeInTheDocument();
    expect(screen.getByText("Cadence")).toBeInTheDocument();
    expect(screen.getByText("85 rpm")).toBeInTheDocument();
    expect(screen.getByText("Power")).toBeInTheDocument();
    expect(screen.getByText("200 watts")).toBeInTheDocument();

    expect(screen.getByText("Pace")).toBeInTheDocument();
    expect(screen.getByText(/6:00 \/ km/)).toBeInTheDocument();
  });

  test("fires edit and delete callbacks via icon buttons", () => {
    const { onEditSession, onDeleteSession } = renderWith();

    const editBtn = screen.getByTitle(/Edit Session/i);
    const deleteBtn = screen.getByTitle(/Delete Session/i);

    editBtn.click();
    deleteBtn.click();

    expect(onEditSession).toHaveBeenCalledTimes(1);
    expect(onDeleteSession).toHaveBeenCalledTimes(1);
  });

  test("does not render weather block when all weather values are null", () => {
    const sessionNoWeather = {
      ...baseSession,
      weatherTemp: null,
      weatherHumidity: null,
      weatherWindSpeed: null,
    };

    renderWith(sessionNoWeather);

    expect(screen.queryByText(/Weather/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Temp/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Humidity/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Wind/i)).not.toBeInTheDocument();
  });
});
