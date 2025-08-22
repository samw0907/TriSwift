import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import TransitionForm from "../TransitionForm";

describe("TransitionForm Component", () => {
  const mockOnSubmit = vi.fn();
  const mockOnClose = vi.fn();
  const mockOnSkip = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders the form correctly", () => {
    render(<TransitionForm sessionId="123" onSubmit={mockOnSubmit} onClose={mockOnClose}  onSkipToNextActivity={mockOnSkip} />);

    expect(screen.getByLabelText(/Previous Sport:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Next Sport:/i)).toBeInTheDocument();
    expect(screen.getByText(/Transition Time:/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Minutes")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Seconds")).toBeInTheDocument();
    expect(screen.getByLabelText(/Comments:/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Add & Next/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Skip Transition/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Save & Close/i })).toBeInTheDocument();
  });

  test("updates input fields correctly", () => {
    render(<TransitionForm sessionId="123" onSubmit={mockOnSubmit} onClose={mockOnClose} onSkipToNextActivity={mockOnSkip}/>);

    fireEvent.change(screen.getByLabelText(/Previous Sport:/i), { target: { value: "Swim" } });
    fireEvent.change(screen.getByLabelText(/Next Sport:/i), { target: { value: "Bike" } });
    fireEvent.change(screen.getByPlaceholderText("Minutes"), { target: { value: "2" } });
    fireEvent.change(screen.getByPlaceholderText("Seconds"), { target: { value: "30" } });
    fireEvent.change(screen.getByLabelText(/Comments:/i), { target: { value: "Quick change" } });

    expect(screen.getByLabelText(/Previous Sport:/i)).toHaveValue("Swim");
    expect(screen.getByLabelText(/Next Sport:/i)).toHaveValue("Bike");
    expect(screen.getByPlaceholderText("Minutes")).toHaveValue(2);
    expect(screen.getByPlaceholderText("Seconds")).toHaveValue(30);
    expect(screen.getByLabelText(/Comments:/i)).toHaveValue("Quick change");
  });

  test("submits with correct data via 'Add & Next' (does not close)", () => {
    render(<TransitionForm sessionId="123" onSubmit={mockOnSubmit} onClose={mockOnClose} onSkipToNextActivity={mockOnSkip} />);

    fireEvent.change(screen.getByLabelText(/Previous Sport:/i), { target: { value: "Run" } });
    fireEvent.change(screen.getByLabelText(/Next Sport:/i), { target: { value: "Bike" } });
    fireEvent.change(screen.getByPlaceholderText("Minutes"), { target: { value: "1" } });
    fireEvent.change(screen.getByPlaceholderText("Seconds"), { target: { value: "15" } });
    fireEvent.change(screen.getByLabelText(/Comments:/i), { target: { value: "Fast transition" } });
    fireEvent.click(screen.getByRole("button", { name: /Add & Next/i }));

    expect(mockOnSubmit).toHaveBeenCalledWith({
      previousSport: "Run",
      nextSport: "Bike",
      transitionTime: 75,
      comments: "Fast transition",
    });
  });

    test("'Save & Close' submits and calls onClose", () => {
    render(
      <TransitionForm
        sessionId="123"
        onSubmit={mockOnSubmit}
        onClose={mockOnClose}
        onSkipToNextActivity={mockOnSkip}
      />
    );

    fireEvent.change(screen.getByLabelText(/Previous Sport:/i), { target: { value: "Swim" } });
    fireEvent.change(screen.getByLabelText(/Next Sport:/i), { target: { value: "Run" } });
    fireEvent.change(screen.getByPlaceholderText("Minutes"), { target: { value: "0" } });
    fireEvent.change(screen.getByPlaceholderText("Seconds"), { target: { value: "45" } });
    fireEvent.change(screen.getByLabelText(/Comments:/i), { target: { value: "T1" } });

    fireEvent.click(screen.getByRole("button", { name: /Save & Close/i }));

    expect(mockOnSubmit).toHaveBeenCalledWith({
      previousSport: "Swim",
      nextSport: "Run",
      transitionTime: 45,
      comments: "T1",
    });
    expect(mockOnClose).toHaveBeenCalled();
  });

  test("'Skip Transition' calls onSkipToNextActivity without submitting", () => {
    render(
      <TransitionForm
        sessionId="123"
        onSubmit={mockOnSubmit}
        onClose={mockOnClose}
        onSkipToNextActivity={mockOnSkip}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Skip Transition/i }));

    expect(mockOnSubmit).not.toHaveBeenCalled();
    expect(mockOnSkip).toHaveBeenCalled();
  });

  test("triggers onCancel when Cancel is clicked", () => {
    render(<TransitionForm sessionId="123" onSubmit={mockOnSubmit} onClose={mockOnClose} onSkipToNextActivity={mockOnSkip} />);

    fireEvent.click(screen.getByRole("button", { name: /Save & Close/i }));

    expect(mockOnClose).toHaveBeenCalled();
  });
});
