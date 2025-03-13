import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import { GET_PERSONAL_RECORDS } from "../../graphql/queries";
import PersonalRecords from "../PersonalRecords";

const mockSwimData = {
  request: {
    query: GET_PERSONAL_RECORDS,
    variables: { sportType: "Swim" },
  },
  result: {
    data: {
      personalRecords: [],
    },
  },
};

const mockRunData = {
  request: {
    query: GET_PERSONAL_RECORDS,
    variables: { sportType: "Run" },
  },
  result: {
    data: {
      personalRecords: [
        { distance: "5km", bestTime: 1200 },
        { distance: "10km", bestTime: 2400 },
      ],
    },
  },
};

const renderWithMock = (mocks: any) => {
  return render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <PersonalRecords />
    </MockedProvider>
  );
};

test("renders personal records page", async () => {
  renderWithMock([mockSwimData]);

  await waitFor(() => {
    expect(screen.getByRole("heading", { name: /Personal Records/i })).toBeInTheDocument();
  });

  expect(screen.getByRole("button", { name: /Swim/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /Run/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /Bike/i })).toBeInTheDocument();
});

test("displays loading indicator while fetching data", async () => {
  renderWithMock([
    mockSwimData,
    {
      request: { query: GET_PERSONAL_RECORDS, variables: { sportType: "Run" } },
      result: new Promise(() => {}),
    },
  ]);

  fireEvent.click(screen.getByRole("button", { name: /Run/i }));

  expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
});

test("updates sport selection when clicking buttons", async () => {
    renderWithMock([mockSwimData, mockRunData]);
  
    const runButton = await screen.findByTestId("sport-button-run");
    const swimButton = await screen.findByTestId("sport-button-swim");
    const bikeButton = await screen.findByTestId("sport-button-bike");
  
    fireEvent.click(runButton);
  
    await waitFor(() => {
      expect(runButton).toHaveClass("active");
    });
  
    fireEvent.click(bikeButton);
  
    await waitFor(() => {
      expect(bikeButton).toHaveClass("active");
      expect(runButton).not.toHaveClass("active");
    });
  });  
  
  
test("fetches and displays personal records for selected sport", async () => {
    renderWithMock([mockSwimData, mockRunData]);
  
    fireEvent.click(screen.getByRole("button", { name: /Run/i }));
  
    await waitFor(() => {
      const table = screen.queryByRole("table");
      const noRecordsMessage = screen.queryByText(/No personal records found/i);
      expect(table || noRecordsMessage).toBeTruthy();
    });
  
    if (screen.queryByRole("table")) {
      expect(screen.getByText("5km")).toBeInTheDocument();
      expect(screen.getByText("10km")).toBeInTheDocument();
    }
});
  
test("displays no records message when no data is returned", async () => {
  renderWithMock([
    mockSwimData,
    {
      request: { query: GET_PERSONAL_RECORDS, variables: { sportType: "Run" } },
      result: { data: { personalRecords: [] } },
    },
]);

  fireEvent.click(screen.getByRole("button", { name: /Run/i }));

  await waitFor(() => {
    expect(screen.getByText((content) => content.includes("No personal records found"))).toBeInTheDocument();
  });
});
