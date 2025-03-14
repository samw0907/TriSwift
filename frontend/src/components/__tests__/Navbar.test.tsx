import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { vi } from "vitest";
import Navbar from "../Navbar";
import { AuthContext } from "../../context/AuthContext";

const renderWithAuth = (isAuthenticated: boolean, logoutUser = vi.fn()) => {
  return render(
    <AuthContext.Provider value={{ isAuthenticated, loginUser: vi.fn(), logoutUser }}>
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    </AuthContext.Provider>
  );
};

test("renders all navigation links", () => {
  renderWithAuth(false);
  expect(screen.getByText(/Home/i)).toBeInTheDocument();
  expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
  expect(screen.getByText(/Personal Records/i)).toBeInTheDocument();
  expect(screen.getByText(/Pace Calculator/i)).toBeInTheDocument();
});

test("shows login and signup buttons when no user is logged in", () => {
  renderWithAuth(false);
  expect(screen.getByText(/Login/i)).toBeInTheDocument();
  expect(screen.getByText(/Signup/i)).toBeInTheDocument();
  expect(screen.queryByText(/Logout/i)).toBeNull();
});

test("clicking login button navigates to login page", async () => {
  const user = userEvent.setup();
  renderWithAuth(false);
  const loginButton = screen.getByText(/Login/i);
  expect(loginButton).toBeInTheDocument();
  await user.click(loginButton);
  expect(window.location.pathname).toBe("/login");
});

test("shows logout button and hides login/signup when user is logged in", () => {
  renderWithAuth(true);
  expect(screen.queryByText(/Login/i)).toBeNull();
  expect(screen.queryByText(/Signup/i)).toBeNull();
  expect(screen.getByText(/Logout/i)).toBeInTheDocument();
});

test("clicking logout calls logout function and navigates to landing page", async () => {
  const user = userEvent.setup();
  const mockLogout = vi.fn();
  renderWithAuth(true, mockLogout);
  const logoutButton = screen.getByRole("button", { name: /logout/i });
  expect(logoutButton).toBeInTheDocument();
  await user.click(logoutButton);
  expect(mockLogout).toHaveBeenCalledTimes(1);
});

test("clicking signup button navigates to signup page", async () => {
  const user = userEvent.setup();
  renderWithAuth(false);
  const signupButton = screen.getByText(/Signup/i);
  expect(signupButton).toBeInTheDocument();
  await user.click(signupButton);
  expect(window.location.pathname).toBe("/signup");
});
