import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import { vi } from "vitest";
import EditTransitionForm from "../EditTransitionForm";
import { UPDATE_TRANSITION_MUTATION } from "../../../graphql/mutations";

const mockOnClose = vi.fn();
const mockOnUpdate = vi.fn();

const mockTransition = {
  id: "t1",
  previousSport: "Swim",
  nextSport: "Bike",
  transitionTime: 120,
  comments: "Quick change",
};

const mockUpdateMutation = {
  request: {
    query: UPDATE_TRANSITION_MUTATION,
    variables: {
      id: "t1",
      input: {
        previousSport: "Swim",
        nextSport: "Bike",
        transitionTime: 150,
        comments: "Updated transition",
      },
    },
  },
  result: {
    data: {
      updateTransition: {
        id: "t1",
        previousSport: "Swim",
        nextSport: "Bike",
        transitionTime: 150,
        comments: "Updated transition",
      },
    },
  },
};

describe("EditTransitionForm Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = (mocks = []) =>
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <EditTransitionForm transition={mockTransition} onClose={mockOnClose} onUpdate={mockOnUpdate} />
      </MockedProvider>
    );

  test("renders the form with correct initial values", () => {
    renderComponent();

    expect(screen.getByLabelText(/Previous Sport:/i)).toHaveValue("Swim");
    expect(screen.getByLabelText(/Next Sport:/i)).toHaveValue("Bike");
    expect(screen.getByPlaceholderText("Minutes")).toHaveValue(2);
    expect(screen.getByPlaceholderText("Seconds")).toHaveValue(0);
    expect(screen.getByLabelText(/Comments:/i)).toHaveValue("Quick change");
  });

  test("updates input fields correctly", () => {
    renderComponent();

    fireEvent.change(screen.getByPlaceholderText("Minutes"), { target: { value: "2" } });
    fireEvent.change(screen.getByPlaceholderText("Seconds"), { target: { value: "30" } });
    fireEvent.change(screen.getByLabelText(/Comments:/i), { target: { value: "Updated transition" } });

    expect(screen.getByPlaceholderText("Minutes")).toHaveValue(2);
    expect(screen.getByPlaceholderText("Seconds")).toHaveValue(30);
    expect(screen.getByLabelText(/Comments:/i)).toHaveValue("Updated transition");
  });

  test("submits the form with correct data", async () => {
    renderComponent([mockUpdateMutation]);

    fireEvent.change(screen.getByPlaceholderText("Minutes"), { target: { value: "2" } });
    fireEvent.change(screen.getByPlaceholderText("Seconds"), { target: { value: "30" } });
    fireEvent.change(screen.getByLabelText(/Comments:/i), { target: { value: "Updated transition" } });

    fireEvent.click(screen.getByRole("button", { name: /Save/i }));

    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  test("triggers onClose when Cancel is clicked", () => {
    renderComponent();

    fireEvent.click(screen.getByRole("button", { name: /Cancel/i }));

    expect(mockOnClose).toHaveBeenCalled();
  });
});
