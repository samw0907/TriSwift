import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import SessionForm from "../SessionForm";

describe("SessionForm Component", () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders the form correctly", () => {
    render(<SessionForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    expect(screen.getByLabelText(/Session Type:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Date:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Weather Temp/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Weather Humidity/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Wind Speed/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Next/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Cancel/i })).toBeInTheDocument();
  });

  test("updates input fields correctly", () => {
    render(<SessionForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    fireEvent.change(screen.getByLabelText(/Session Type:/i), { target: { value: "Run" } });
    fireEvent.change(screen.getByLabelText(/Date:/i), { target: { value: "2025-03-14" } });
    fireEvent.change(screen.getByLabelText(/Weather Temp/i), { target: { value: "20" } });

    expect(screen.getByLabelText(/Session Type:/i)).toHaveValue("Run");
    expect(screen.getByLabelText(/Date:/i)).toHaveValue("2025-03-14");
    expect(screen.getByLabelText(/Weather Temp/i)).toHaveValue(20);
  });

  test("submits the form with correct data", () => {
    render(<SessionForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    fireEvent.change(screen.getByLabelText(/Session Type:/i), { target: { value: "Bike" } });
    fireEvent.change(screen.getByLabelText(/Date:/i), { target: { value: "2025-03-14" } });
    fireEvent.change(screen.getByLabelText(/Weather Temp/i), { target: { value: "15" } });
    fireEvent.click(screen.getByRole("button", { name: /Next/i }));

    expect(mockOnSubmit).toHaveBeenCalledWith({
      sessionType: "Bike",
      date: "2025-03-14",
      weatherTemp: "15",
      weatherHumidity: "",
      weatherWindSpeed: "",
    });
  });

  test("triggers onCancel when Cancel is clicked", () => {
    render(<SessionForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    fireEvent.click(screen.getByRole("button", { name: /Cancel/i }));

    expect(mockOnCancel).toHaveBeenCalled();
  });
});
