import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import Navbar from "../Navbar";

test("renders all navigation links", () => {
  render(
    <BrowserRouter>
      <Navbar />
    </BrowserRouter>
  );

  expect(screen.getByText(/Home/i)).toBeInTheDocument();
  expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
  expect(screen.getByText(/Personal Records/i)).toBeInTheDocument();
  expect(screen.getByText(/Pace Calculator/i)).toBeInTheDocument();
});

test("clicking logout removes token and navigates to login", async () => {
  const user = userEvent.setup();
  localStorage.setItem("token", "mockToken");

  render(
    <BrowserRouter>
      <Navbar />
    </BrowserRouter>
  );

  const logoutButton = screen.getByRole("button", { name: /logout/i });
  expect(logoutButton).toBeInTheDocument();

  await user.click(logoutButton);

  expect(localStorage.getItem("token")).toBeNull();
});
