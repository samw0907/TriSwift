import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import PaceCalculator from "../PaceCalculator";

describe("Pace Calculator", () => {
  beforeEach(() => {
    render(<PaceCalculator />);
  });

  test("renders Pace Calculator page", () => {
    expect(screen.getByRole("heading", { name: /Pace Calculator/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Sport:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Distance:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Target Time:/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Calculate Pace/i })).toBeInTheDocument();
  });

  test("updates sport selection", () => {
    const sportSelect = screen.getByLabelText(/Sport:/i) as HTMLSelectElement;
    fireEvent.change(sportSelect, { target: { value: "Swim" } });
    expect(sportSelect.value).toBe("Swim");

    fireEvent.change(sportSelect, { target: { value: "Bike" } });
    expect(sportSelect.value).toBe("Bike");
  });

  test("updates time input fields", async () => {
    const hoursInput = screen.getByPlaceholderText("HH") as HTMLInputElement;
    const minutesInput = screen.getByPlaceholderText("MM") as HTMLInputElement;
    const secondsInput = screen.getByPlaceholderText("SS") as HTMLInputElement;

    fireEvent.change(hoursInput, { target: { value: "1" } });
    fireEvent.change(minutesInput, { target: { value: "30" } });
    fireEvent.change(secondsInput, { target: { value: "45" } });

    await waitFor(() => {
      expect(hoursInput).toHaveValue(1);
      expect(minutesInput).toHaveValue(30);
      expect(secondsInput).toHaveValue(45);
    });
  });

  test("calculates pace correctly for running", async () => {
    fireEvent.change(screen.getByLabelText(/Sport:/i), { target: { value: "Run" } });
    fireEvent.change(screen.getByLabelText(/Distance:/i), { target: { value: "10k" } });

    fireEvent.change(screen.getByPlaceholderText("HH"), { target: { value: "0" } });
    fireEvent.change(screen.getByPlaceholderText("MM"), { target: { value: "50" } });
    fireEvent.change(screen.getByPlaceholderText("SS"), { target: { value: "0" } });

    fireEvent.click(screen.getByRole("button", { name: /Calculate Pace/i }));

    expect(await screen.findByText(/Target Pace: 5:00 min\/km/i)).toBeInTheDocument();
  });

  test("calculates pace correctly for swimming", async () => {
    fireEvent.change(screen.getByLabelText(/Sport:/i), { target: { value: "Swim" } });
    fireEvent.change(screen.getByLabelText(/Distance:/i), { target: { value: "1000" } });

    fireEvent.change(screen.getByPlaceholderText("HH"), { target: { value: "0" } });
    fireEvent.change(screen.getByPlaceholderText("MM"), { target: { value: "20" } });
    fireEvent.change(screen.getByPlaceholderText("SS"), { target: { value: "0" } });

    fireEvent.click(screen.getByRole("button", { name: /Calculate Pace/i }));

    expect(await screen.findByText(/Target Pace: 2:00 min\/100m/i)).toBeInTheDocument();
  });

  test("calculates speed correctly for biking", async () => {
    fireEvent.change(screen.getByLabelText(/Sport:/i), { target: { value: "Bike" } });
    fireEvent.change(screen.getByLabelText(/Distance:/i), { target: { value: "40k" } });

    fireEvent.change(screen.getByPlaceholderText("HH"), { target: { value: "1" } });
    fireEvent.change(screen.getByPlaceholderText("MM"), { target: { value: "0" } });
    fireEvent.change(screen.getByPlaceholderText("SS"), { target: { value: "0" } });

    fireEvent.click(screen.getByRole("button", { name: /Calculate Pace/i }));

    expect(await screen.findByText(/Target Pace: 40.0 km\/h/i)).toBeInTheDocument();
  });

  test("shows 'Invalid input' when input is missing", async () => {
    fireEvent.click(screen.getByRole("button", { name: /Calculate Pace/i }));

    expect(await screen.findByText(/Target Pace: Invalid input/i)).toBeInTheDocument();
  });
});
