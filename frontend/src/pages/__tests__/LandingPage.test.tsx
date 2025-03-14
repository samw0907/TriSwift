import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LandingPage from "../LandingPage";

describe("LandingPage Component", () => {
  test("renders the landing page with correct text and buttons", () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Welcome to TriSwift");
    expect(screen.getByText("The ultimate fitness tracking app for triathletes.")).toBeInTheDocument();
    expect(screen.getByText("Log your workouts, track your progress, and optimize your training.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign up/i })).toBeInTheDocument();
  });
});
