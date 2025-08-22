import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import ActivityForm from "../ActivityForm";

describe("ActivityForm (single-sport session)", () => {
  const mockOnSubmit = vi.fn();
  const mockOnClose = vi.fn();
  const mockCancelDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    window.alert = vi.fn();
  });

  test("renders the form correctly (Run)", () => {
    render(
      <ActivityForm
        sessionId="123"
        sessionType="Run"
        onSubmit={mockOnSubmit}
        onClose={mockOnClose}
        onCancelAndDeleteSession={mockCancelDelete}
      />
    );

    expect(screen.getByText(/Duration/i)).toBeInTheDocument();
    expect(screen.getByText(/Distance \(km\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/HR Min/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/HR Max/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/HR Avg/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Cadence/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Power/i)).toBeInTheDocument();

    expect(screen.getByRole("button", { name: /Submit Activity/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Cancel/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Submit & Close/i })).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Activity Type/i)).not.toBeInTheDocument();
  });

  test("updates input fields correctly", () => {
    render(
      <ActivityForm
        sessionId="123"
        sessionType="Run"
        onSubmit={mockOnSubmit}
        onClose={mockOnClose}
        onCancelAndDeleteSession={mockCancelDelete}
      />
    );

    fireEvent.change(screen.getByPlaceholderText("Hrs"), { target: { value: "1" } });
    fireEvent.change(screen.getByPlaceholderText("Mins"), { target: { value: "30" } });
    fireEvent.change(screen.getByPlaceholderText("Secs"), { target: { value: "15" } });
    fireEvent.change(screen.getByLabelText(/Distance/i), { target: { value: "5.2" } });

    expect(screen.getByPlaceholderText("Hrs")).toHaveValue(1);
    expect(screen.getByPlaceholderText("Mins")).toHaveValue(30);
    expect(screen.getByPlaceholderText("Secs")).toHaveValue(15);
    expect(screen.getByLabelText(/Distance/i)).toHaveValue(5.2);
  });

  test("submits the form with correct data and closes", () => {
    render(
      <ActivityForm
        sessionId="123"
        sessionType="Run"
        onSubmit={mockOnSubmit}
        onClose={mockOnClose}
        onCancelAndDeleteSession={mockCancelDelete}
      />
    );

    fireEvent.change(screen.getByPlaceholderText("Hrs"), { target: { value: "1" } });
    fireEvent.change(screen.getByPlaceholderText("Mins"), { target: { value: "10" } });
    fireEvent.change(screen.getByPlaceholderText("Secs"), { target: { value: "30" } });
    fireEvent.change(screen.getByLabelText(/Distance/i), { target: { value: "12.5" } });

    fireEvent.click(screen.getByRole("button", { name: /Submit Activity/i }));

    expect(mockOnSubmit).toHaveBeenCalledWith({
      sportType: "Run",
      duration: 4230,
      distance: 12.5,
      heartRateMin: null,
      heartRateMax: null,
      heartRateAvg: null,
      cadence: null,
      power: null,
    });
    expect(mockOnClose).toHaveBeenCalled();
  });

  test("rejects invalid duration (zero)", () => {
    render(
      <ActivityForm
        sessionId="123"
        sessionType="Run"
        onSubmit={mockOnSubmit}
        onClose={mockOnClose}
        onCancelAndDeleteSession={mockCancelDelete}
      />
    );

    fireEvent.change(screen.getByPlaceholderText("Hrs"), { target: { value: "0" } });
    fireEvent.change(screen.getByPlaceholderText("Mins"), { target: { value: "0" } });
    fireEvent.change(screen.getByPlaceholderText("Secs"), { target: { value: "0" } });
    fireEvent.change(screen.getByLabelText(/Distance/i), { target: { value: "5" } });

    fireEvent.click(screen.getByRole("button", { name: /Submit Activity/i }));

    expect(mockOnSubmit).not.toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalled();
  });

  test("Cancel calls onCancelAndDeleteSession with id", () => {
    render(
      <ActivityForm
        sessionId="123"
        sessionType="Run"
        onSubmit={mockOnSubmit}
        onClose={mockOnClose}
        onCancelAndDeleteSession={mockCancelDelete}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Cancel/i }));
    expect(mockCancelDelete).toHaveBeenCalledWith("123");
  });
});

describe("ActivityForm (multi-sport session)", () => {
  const mockOnSubmit = vi.fn();
  const mockOnClose = vi.fn();
  const mockCancelDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    window.alert = vi.fn();
  });

  test("renders multi-sport controls and buttons", () => {
    render(
      <ActivityForm
        sessionId="abc"
        sessionType="Multi-Sport"
        onSubmit={mockOnSubmit}
        onClose={mockOnClose}
        onCancelAndDeleteSession={mockCancelDelete}
      />
    );

    expect(screen.getByLabelText(/Activity Type/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Add & Next/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Submit & Close/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Cancel/i })).toBeInTheDocument();
  });

  test("distance label switches to (m) when Swim is selected", () => {
    render(
      <ActivityForm
        sessionId="abc"
        sessionType="Multi-Sport"
        onSubmit={mockOnSubmit}
        onClose={mockOnClose}
        onCancelAndDeleteSession={mockCancelDelete}
      />
    );

    expect(screen.getByText(/Distance \(km\)/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Activity Type/i), {
      target: { value: "Swim" },
    });

    expect(screen.getByText(/Distance \(m\)/i)).toBeInTheDocument();
  });

  test("Add & Next submits without closing", () => {
    render(
      <ActivityForm
        sessionId="abc"
        sessionType="Multi-Sport"
        onSubmit={mockOnSubmit}
        onClose={mockOnClose}
        onCancelAndDeleteSession={mockCancelDelete}
      />
    );

    fireEvent.change(screen.getByLabelText(/Activity Type/i), {
      target: { value: "Run" },
    });
    fireEvent.change(screen.getByPlaceholderText("Hrs"), { target: { value: "0" } });
    fireEvent.change(screen.getByPlaceholderText("Mins"), { target: { value: "45" } });
    fireEvent.change(screen.getByPlaceholderText("Secs"), { target: { value: "0" } });
    fireEvent.change(screen.getByLabelText(/Distance/i), { target: { value: "10" } });

    fireEvent.click(screen.getByRole("button", { name: /Add & Next/i }));

    expect(mockOnSubmit).toHaveBeenCalledWith({
      sportType: "Run",
      duration: 2700,
      distance: 10,
      heartRateMin: null,
      heartRateMax: null,
      heartRateAvg: null,
      cadence: null,
      power: null,
    });
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  test("Submit & Close submits and calls onClose", () => {
    render(
      <ActivityForm
        sessionId="abc"
        sessionType="Multi-Sport"
        onSubmit={mockOnSubmit}
        onClose={mockOnClose}
        onCancelAndDeleteSession={mockCancelDelete}
      />
    );

    fireEvent.change(screen.getByLabelText(/Activity Type/i), {
      target: { value: "Bike" },
    });
    fireEvent.change(screen.getByPlaceholderText("Hrs"), { target: { value: "1" } });
    fireEvent.change(screen.getByPlaceholderText("Mins"), { target: { value: "0" } });
    fireEvent.change(screen.getByPlaceholderText("Secs"), { target: { value: "0" } });
    fireEvent.change(screen.getByLabelText(/Distance/i), { target: { value: "30" } });

    fireEvent.click(screen.getByRole("button", { name: /Submit & Close/i }));

    expect(mockOnSubmit).toHaveBeenCalledWith({
      sportType: "Bike",
      duration: 3600,
      distance: 30,
      heartRateMin: null,
      heartRateMax: null,
      heartRateAvg: null,
      cadence: null,
      power: null,
    });
    expect(mockOnClose).toHaveBeenCalled();
  });

  test("Cancel in multi-sport calls onCancelAndDeleteSession", () => {
    render(
      <ActivityForm
        sessionId="abc"
        sessionType="Multi-Sport"
        onSubmit={mockOnSubmit}
        onClose={mockOnClose}
        onCancelAndDeleteSession={mockCancelDelete}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Cancel/i }));
    expect(mockCancelDelete).toHaveBeenCalledWith("abc");
  });
});
