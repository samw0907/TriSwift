import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ActivityForm from "../ActivityForm";

describe("ActivityForm Component", () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders the form correctly", () => {
    render(<ActivityForm sessionId="123" sessionType="Run" onSubmit={mockOnSubmit} onClose={mockOnCancel} />);

    expect(screen.getByText(/Duration:/i)).toBeInTheDocument();
    expect(screen.getByText(/Distance \(km\):/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Heart Rate Min:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Heart Rate Max:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Heart Rate Avg:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Cadence:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Power:/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Submit Activity/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Save & Close/i })).toBeInTheDocument();
  });

  test("updates input fields correctly", () => {
    render(<ActivityForm sessionId="123" sessionType="Run" onSubmit={mockOnSubmit} onClose={mockOnCancel} />);

    fireEvent.change(screen.getByPlaceholderText("Hrs"), { target: { value: "1" } });
    fireEvent.change(screen.getByPlaceholderText("Mins"), { target: { value: "30" } });
    fireEvent.change(screen.getByPlaceholderText("Secs"), { target: { value: "15" } });
    fireEvent.change(screen.getByLabelText(/Distance/i), { target: { value: "5.2" } });

    expect(screen.getByPlaceholderText("Hrs")).toHaveValue(1);
    expect(screen.getByPlaceholderText("Mins")).toHaveValue(30);
    expect(screen.getByPlaceholderText("Secs")).toHaveValue(15);
    expect(screen.getByLabelText(/Distance/i)).toHaveValue(5.2);
  });

  test("submits the form with correct data", () => {
    render(<ActivityForm sessionId="123" sessionType="Run" onSubmit={mockOnSubmit} onClose={mockOnCancel} />);

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
  });

  test("rejects invalid duration (zero)", () => {
    render(<ActivityForm sessionId="123" sessionType="Run" onSubmit={mockOnSubmit} onClose={mockOnCancel} />);

    fireEvent.change(screen.getByPlaceholderText("Hrs"), { target: { value: "0" } });
    fireEvent.change(screen.getByPlaceholderText("Mins"), { target: { value: "0" } });
    fireEvent.change(screen.getByPlaceholderText("Secs"), { target: { value: "0" } });
    fireEvent.click(screen.getByRole("button", { name: /Submit Activity/i }));

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  test("triggers onCancel when Cancel is clicked", () => {
    render(<ActivityForm sessionId="123" sessionType="Run" onSubmit={mockOnSubmit} onClose={mockOnCancel} />);
    
    fireEvent.click(screen.getByRole("button", { name: /Save & Close/i }));

    expect(mockOnCancel).toHaveBeenCalled();
  });
});
