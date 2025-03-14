import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import { vi } from "vitest";
import EditActivityForm from "../EditActivityForm";
import { UPDATE_SESSION_ACTIVITY } from "../../../graphql/mutations";
import { GET_PERSONAL_RECORDS } from "../../../graphql/queries";

describe("EditActivityForm Component", () => {
  const mockOnClose = vi.fn();
  const mockOnUpdate = vi.fn();

  const mockActivity = {
    id: "1",
    sportType: "Run",
    duration: 3600,
    distance: 10,
    heartRateMin: 120,
    heartRateMax: 180,
    heartRateAvg: 150,
    cadence: 85,
    power: 250,
  };

  const mockMutation = {
    request: {
      query: UPDATE_SESSION_ACTIVITY,
      variables: {
        id: mockActivity.id,
        input: {
          sportType: "Run",
          duration: 3600,
          distance: 15,
          heartRateMin: 120,
          heartRateMax: 180,
          heartRateAvg: 150,
          cadence: 85,
          power: 250,
        },
      },
    },
    result: {
      data: {
        updateActivity: {
          id: mockActivity.id,
          sportType: "Run",
          duration: 3600,
          distance: 15,
          heartRateMin: 120,
          heartRateMax: 180,
          heartRateAvg: 150,
          cadence: 85,
          power: 250,
        },
      },
    },
  };

  const mockPersonalRecordsQuery = {
    request: {
      query: GET_PERSONAL_RECORDS,
      variables: { sportType: "Run" },
    },
    result: {
      data: {
        personalRecords: [],
      },
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders the form correctly", () => {
    render(
      <MockedProvider mocks={[mockMutation, mockPersonalRecordsQuery]} addTypename={false}>
        <EditActivityForm activity={mockActivity} onClose={mockOnClose} onUpdate={mockOnUpdate} />
      </MockedProvider>
    );

    expect(screen.getByLabelText(/Sport Type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Hours/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Minutes/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Seconds/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Distance/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Heart Rate Min/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Heart Rate Max/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Heart Rate Avg/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Cadence/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Power/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Save/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Cancel/i })).toBeInTheDocument();
  });

  test("updates input fields correctly", () => {
    render(
      <MockedProvider mocks={[mockMutation, mockPersonalRecordsQuery]} addTypename={false}>
        <EditActivityForm activity={mockActivity} onClose={mockOnClose} onUpdate={mockOnUpdate} />
      </MockedProvider>
    );

    fireEvent.change(screen.getByLabelText(/Distance/i), { target: { value: "12" } });
    fireEvent.change(screen.getByLabelText(/Heart Rate Min/i), { target: { value: "110" } });
    fireEvent.change(screen.getByLabelText(/Power/i), { target: { value: "300" } });

    expect(screen.getByLabelText(/Distance/i)).toHaveValue(12);
    expect(screen.getByLabelText(/Heart Rate Min/i)).toHaveValue(110);
    expect(screen.getByLabelText(/Power/i)).toHaveValue(300);
  });

  test("submits the form with updated data", async () => {
    render(
      <MockedProvider mocks={[mockMutation, mockPersonalRecordsQuery]} addTypename={false}>
        <EditActivityForm activity={mockActivity} onClose={mockOnClose} onUpdate={mockOnUpdate} />
      </MockedProvider>
    );

    fireEvent.change(screen.getByLabelText(/Distance/i), { target: { value: "15" } });
    fireEvent.click(screen.getByRole("button", { name: /Save/i }));

    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  test("triggers onClose when Cancel is clicked", () => {
    render(
      <MockedProvider mocks={[mockMutation, mockPersonalRecordsQuery]} addTypename={false}>
        <EditActivityForm activity={mockActivity} onClose={mockOnClose} onUpdate={mockOnUpdate} />
      </MockedProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: /Cancel/i }));
    expect(mockOnClose).toHaveBeenCalled();
  });
});
