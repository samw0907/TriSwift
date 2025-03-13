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

test("shows login and signup buttons when no user is logged in", () => {
  render(
    <BrowserRouter>
      <Navbar />
    </BrowserRouter>
  );

  expect(screen.getByText(/Login/i)).toBeInTheDocument();
  expect(screen.getByText(/Signup/i)).toBeInTheDocument();
  expect(screen.queryByText(/Logout/i)).toBeNull();
});

test("clicking login button navigates to login page", async () => {
  const user = userEvent.setup();

  render(
    <BrowserRouter>
      <Navbar />
    </BrowserRouter>
  );

  const loginButton = screen.getByText(/Login/i);
  expect(loginButton).toBeInTheDocument();

  await user.click(loginButton);
  expect(window.location.pathname).toBe("/login");
});

test("shows logout button and hides login/signup when user is logged in", () => {
  localStorage.setItem("token", "mockToken");

  render(
    <BrowserRouter>
      <Navbar />
    </BrowserRouter>
  );

  expect(screen.queryByText(/Login/i)).toBeNull();
  expect(screen.queryByText(/Signup/i)).toBeNull();
  expect(screen.getByText(/Logout/i)).toBeInTheDocument();
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

test("clicking signup button navigates to signup page", async () => {
  const user = userEvent.setup();

  render(
    <BrowserRouter>
      <Navbar />
    </BrowserRouter>
  );

  const signupButton = screen.getByText(/Signup/i);
  expect(signupButton).toBeInTheDocument();

  await user.click(signupButton);
  expect(window.location.pathname).toBe("/signup");
});