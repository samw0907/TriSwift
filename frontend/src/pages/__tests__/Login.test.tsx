import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import Login from "../Login";
import { AuthProvider } from "../../context/AuthContext";
import { LOGIN_USER } from "../../graphql/mutations";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

const successMock = {
  request: {
    query: LOGIN_USER,
    variables: { email: "test@example.com", password: "password123" },
  },
  result: {
    data: {
      login: { token: "fake-jwt-token" },
    },
  },
};

const errorMock = {
  request: {
    query: LOGIN_USER,
    variables: { email: "wrong@example.com", password: "wrongpassword" },
  },
  error: new Error("Invalid email or password"),
};

const renderWithMock = (mocks: any) => {
  return render(
    <AuthProvider>
      <MockedProvider mocks={mocks} addTypename={false}>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </MockedProvider>
    </AuthProvider>
  );
};

test("renders login form", () => {
  renderWithMock([]);
  expect(screen.getByRole("heading", { name: /login/i })).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/Email/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/Password/i)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /Login/i })).toBeInTheDocument();
});

test("updates input fields", () => {
  renderWithMock([]);
  const emailInput = screen.getByPlaceholderText(/Email/i);
  const passwordInput = screen.getByPlaceholderText(/Password/i);
  fireEvent.change(emailInput, { target: { value: "test@example.com" } });
  fireEvent.change(passwordInput, { target: { value: "password123" } });
  expect(emailInput).toHaveValue("test@example.com");
  expect(passwordInput).toHaveValue("password123");
});

test("successful login redirects to dashboard", async () => {
  renderWithMock([successMock]);
  fireEvent.change(screen.getByPlaceholderText(/Email/i), {
    target: { value: "test@example.com" },
  });
  fireEvent.change(screen.getByPlaceholderText(/Password/i), {
    target: { value: "password123" },
  });
  fireEvent.click(screen.getByRole("button", { name: /Login/i }));
  await waitFor(() => {
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
  });
});

test("displays error message on failed login", async () => {
  renderWithMock([errorMock]);
  fireEvent.change(screen.getByPlaceholderText(/Email/i), {
    target: { value: "wrong@example.com" },
  });
  fireEvent.change(screen.getByPlaceholderText(/Password/i), {
    target: { value: "wrongpassword" },
  });
  fireEvent.click(screen.getByRole("button", { name: /Login/i }));
  await waitFor(() => {
    expect(screen.getByText(/Incorrect credentials. Please try again/i)).toBeInTheDocument();
  });
});
