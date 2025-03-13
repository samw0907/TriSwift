import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import Signup from "../Signup";
import { SIGNUP_USER } from "../../graphql/mutations";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

const successMock = {
  request: {
    query: SIGNUP_USER,
    variables: {
      name: "Test User",
      email: "test@example.com",
      password: "password123",
    },
  },
  result: {
    data: {
      signup: { id: "1", name: "Test User", email: "test@example.com" },
    },
  },
};

const errorMock = {
  request: {
    query: SIGNUP_USER,
    variables: {
      name: "Existing User",
      email: "existing@example.com",
      password: "password123",
    },
  },
  error: new Error("Email is already in use"),
};

const renderWithMock = (mocks: any) => {
  return render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    </MockedProvider>
  );
};

test("renders signup form", () => {
  renderWithMock([]);

  expect(screen.getByRole("heading", {name: /signup/i})).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/Name/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/Email/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/Password/i)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /Signup/i })).toBeInTheDocument();
});

test("updates input fields", () => {
  renderWithMock([]);

  fireEvent.change(screen.getByPlaceholderText(/Name/i), {
    target: { value: "Test User" },
  });
  fireEvent.change(screen.getByPlaceholderText(/Email/i), {
    target: { value: "test@example.com" },
  });
  fireEvent.change(screen.getByPlaceholderText(/Password/i), {
    target: { value: "password123" },
  });


  expect(screen.getByPlaceholderText(/Name/i)).toHaveValue("Test User");
  expect(screen.getByPlaceholderText(/Email/i)).toHaveValue("test@example.com");
  expect(screen.getByPlaceholderText(/Password/i)).toHaveValue("password123");
});

test("successful signup redirects to login page", async () => {
  renderWithMock([successMock]);

  fireEvent.change(screen.getByPlaceholderText(/Name/i), {
    target: { value: "Test User" },
  });
  fireEvent.change(screen.getByPlaceholderText(/Email/i), {
    target: { value: "test@example.com" },
  });
  fireEvent.change(screen.getByPlaceholderText(/Password/i), {
    target: { value: "password123" },
  });

  fireEvent.click(screen.getByRole("button", { name: /Signup/i }));

  await waitFor(() => {
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });
});

test("displays error message on duplicate email", async () => {
  renderWithMock([errorMock]);

  fireEvent.change(screen.getByPlaceholderText(/Name/i), {
    target: { value: "Existing User" },
  });
  fireEvent.change(screen.getByPlaceholderText(/Email/i), {
    target: { value: "existing@example.com" },
  });
  fireEvent.change(screen.getByPlaceholderText(/Password/i), {
    target: { value: "password123" },
  });

  fireEvent.click(screen.getByRole("button", { name: /Signup/i }));

  await waitFor(() => {
    expect(
      screen.getByText(/This email is already registered/i)
    ).toBeInTheDocument();
  });
});
