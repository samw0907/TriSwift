import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import { vi } from "vitest";
import EditSessionForm from "../EditSessionForm";
import { UPDATE_SESSION } from "../../../graphql/mutations";

describe("EditSessionForm Component", () => {
  const mockOnClose = vi.fn();
  const mockOnUpdate = vi.fn();

  vi.spyOn(window, "alert").mockImplementation(() => {});

  const mockSession = {
    id: "1",
    sessionType: "Run",
    date: "2025-03-14T12:00:00Z",
    weatherTemp: 20,
    weatherHumidity: 60,
    weatherWindSpeed: 5,
  };

  const mockMutation = {
    request: {
      query: UPDATE_SESSION,
      variables: {
        id: mockSession.id,
        input: {
          sessionType: "Run",
          date: "2025-03-14",
          weatherTemp: 22,
          weatherHumidity: 60,
          weatherWindSpeed: 5,
        },
      },
    },
    result: {
      data: {
        updateSession: {
          id: mockSession.id,
          sessionType: "Run",
          date: "2025-03-14",
          weatherTemp: 22,
          weatherHumidity: 60,
          weatherWindSpeed: 5,
        },
      },
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders the form correctly", () => {
    render(
      <MockedProvider mocks={[mockMutation]} addTypename={false}>
        <EditSessionForm session={mockSession} onClose={mockOnClose} onUpdate={mockOnUpdate} />
      </MockedProvider>
    );

    expect(screen.getByLabelText(/Session Type:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Date:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Weather Temp/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Weather Humidity/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Wind Speed/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Save/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Cancel/i })).toBeInTheDocument();
  });

  test("updates input fields correctly", () => {
    render(
      <MockedProvider mocks={[mockMutation]} addTypename={false}>
        <EditSessionForm session={mockSession} onClose={mockOnClose} onUpdate={mockOnUpdate} />
      </MockedProvider>
    );

    fireEvent.change(screen.getByLabelText(/Weather Temp/i), { target: { value: "22" } });
    fireEvent.change(screen.getByLabelText(/Weather Humidity/i), { target: { value: "60" } });
    fireEvent.change(screen.getByLabelText(/Wind Speed/i), { target: { value: "5" } });

    expect(screen.getByLabelText(/Weather Temp/i)).toHaveValue(22);
    expect(screen.getByLabelText(/Weather Humidity/i)).toHaveValue(60);
    expect(screen.getByLabelText(/Wind Speed/i)).toHaveValue(5);
  });

  test("submits the form with updated data", async () => {
    render(
      <MockedProvider mocks={[mockMutation]} addTypename={false}>
        <EditSessionForm session={mockSession} onClose={mockOnClose} onUpdate={mockOnUpdate} />
      </MockedProvider>
    );

    fireEvent.change(screen.getByLabelText(/Weather Temp/i), { target: { value: "22" } });
    fireEvent.click(screen.getByRole("button", { name: /Save/i }));

    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  test("triggers onClose when Cancel is clicked", () => {
    render(
      <MockedProvider mocks={[mockMutation]} addTypename={false}>
        <EditSessionForm session={mockSession} onClose={mockOnClose} onUpdate={mockOnUpdate} />
      </MockedProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: /Cancel/i }));
    expect(mockOnClose).toHaveBeenCalled();
  });
});
