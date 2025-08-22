import React from "react";
import { render, screen, fireEvent, within, waitFor } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import { vi } from "vitest";
import EditWholeSession from "../EditWholeSession";

import {
  UPDATE_SESSION,
  UPDATE_SESSION_ACTIVITY,
  ADD_SESSION_ACTIVITY,
  UPDATE_TRANSITION_MUTATION,
  ADD_SESSION_TRANSITION,
} from "../../../graphql/mutations";
import { GET_SESSIONS } from "../../../graphql/queries";

const getSessionsMock = {
  request: { query: GET_SESSIONS },
  result: { data: { sessions: [] } },
};

function getControlNextToLabel(
  scope: HTMLElement | Document,
  labelMatcher: string | RegExp,
  tag: "input" | "select" | "textarea" = "input"
) {
  const labelEl = within(scope as HTMLElement).getByText(labelMatcher);
  const row = labelEl.closest(".field-row") ?? labelEl.parentElement;
  if (!row) throw new Error("Label has no parent row");
  const control = row.querySelector(tag);
  if (!control) throw new Error(`No ${tag} found next to label`);
  return control as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
}

describe("EditWholeSession (combined editor)", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("single-sport session (Run)", () => {
    const sessionSingle = {
      id: "s1",
      sessionType: "Run",
      date: "2025-03-14T12:00:00Z",
      weatherTemp: 20,
      weatherHumidity: 60,
      weatherWindSpeed: 5,
      activities: [
        {
          id: "a1",
          sportType: "Run",
          duration: 3600,
          distance: 10,
          heartRateMin: 120,
          heartRateMax: 180,
          heartRateAvg: 150,
          cadence: 85,
          power: 250,
        },
      ],
      transitions: [],
    };

    test("renders and saves updates (distance + weather) then closes", async () => {
      const onClose = vi.fn();
      const onUpdate = vi.fn();

      const updateSessionMock = {
        request: {
          query: UPDATE_SESSION,
          variables: {
            id: "s1",
            input: {
              sessionType: "Run",
              date: "2025-03-14",
              totalDuration: 3600,
              totalDistance: 12,
              weatherTemp: 22,
              weatherHumidity: 60,
              weatherWindSpeed: 5,
            },
          },
        },
        result: {
          data: {
            updateSession: {
              id: "s1",
              sessionType: "Run",
              date: "2025-03-14",
              totalDuration: 3600,
              totalDistance: 12,
              weatherTemp: 22,
              weatherHumidity: 60,
              weatherWindSpeed: 5,
            },
          },
        },
      };

      const updateActivityMock = {
        request: {
          query: UPDATE_SESSION_ACTIVITY,
          variables: {
            id: "a1",
            input: {
              sportType: "Run",
              duration: 3600,
              distance: 12,
              heartRateMin: 120,
              heartRateMax: 180,
              heartRateAvg: 150,
              cadence: 85,
              power: 250,
            },
          },
        },
        result: {
          data: {
            updateActivity: {
              id: "a1",
              sportType: "Run",
              duration: 3600,
              distance: 12,
              heartRateMin: 120,
              heartRateMax: 180,
              heartRateAvg: 150,
              cadence: 85,
              power: 250,
            },
          },
        },
      };

      const { container } = render(
        <MockedProvider mocks={[updateSessionMock, updateActivityMock, getSessionsMock]} addTypename={false}>
          <EditWholeSession session={sessionSingle as any} onClose={onClose} onUpdate={onUpdate} />
        </MockedProvider>
      );

      const tempInput = getControlNextToLabel(document, "Temp (°C)", "input");
      fireEvent.change(tempInput, { target: { value: "22" } });

      const activityCards = container.querySelectorAll(".activity-card");
      expect(activityCards.length).toBe(1);
      const runCard = activityCards[0] as HTMLElement;
      const distanceInput = getControlNextToLabel(runCard, /^Distance \(km\)$/, "input");
      fireEvent.change(distanceInput, { target: { value: "12" } });

      fireEvent.click(screen.getByRole("button", { name: "Save" }));

      await waitFor(() => {
        expect(onUpdate).toHaveBeenCalled();
        expect(onClose).toHaveBeenCalled();
      });
    });

    test("Cancel closes without saving", () => {
      const onClose = vi.fn();
      const onUpdate = vi.fn();

      render(
        <MockedProvider mocks={[getSessionsMock]} addTypename={false}>
          <EditWholeSession session={sessionSingle as any} onClose={onClose} onUpdate={onUpdate} />
        </MockedProvider>
      );

      fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe("multi-sport session (Swim + Bike, add Run + new Transition)", () => {
    const sessionMulti = {
      id: "ms1",
      sessionType: "Multi-Sport",
      date: "2025-03-14T06:00:00Z",
      weatherTemp: null,
      weatherHumidity: null,
      weatherWindSpeed: null,
      activities: [
        { id: "sa1", sportType: "Swim", duration: 600, distance: 0.5 },
        { id: "sa2", sportType: "Bike", duration: 1800, distance: 20 },
      ],
      transitions: [{ id: "t1", previousSport: "Swim", nextSport: "Bike", transitionTime: 60, comments: "" }],
    };

    test("shows multi-sport controls, can add rows, and saves updates (unit conversion included)", async () => {
      const onClose = vi.fn();
      const onUpdate = vi.fn();

      const updateSessionMock = {
        request: {
          query: UPDATE_SESSION,
          variables: {
            id: "ms1",
            input: {
              sessionType: "Multi-Sport",
              date: "2025-03-14",
              totalDuration: 3420,
              totalDistance: 25.6,
              weatherTemp: null,
              weatherHumidity: null,
              weatherWindSpeed: null,
            },
          },
        },
        result: {
          data: {
            updateSession: {
              id: "ms1",
              sessionType: "Multi-Sport",
              date: "2025-03-14",
              totalDuration: 3420,
              totalDistance: 25.6,
              weatherTemp: null,
              weatherHumidity: null,
              weatherWindSpeed: null,
            },
          },
        },
      };

      const updateSwimActivityMock = {
        request: {
          query: UPDATE_SESSION_ACTIVITY,
          variables: {
            id: "sa1",
            input: {
              sportType: "Swim",
              duration: 600,
              distance: 0.6,
              heartRateMin: null,
              heartRateMax: null,
              heartRateAvg: null,
              cadence: null,
              power: null,
            },
          },
        },
        result: {
          data: {
            updateActivity: {
              id: "sa1",
              sportType: "Swim",
              duration: 600,
              distance: 0.6,
            },
          },
        },
      };

      const updateBikeActivityMock = {
        request: {
          query: UPDATE_SESSION_ACTIVITY,
          variables: {
            id: "sa2",
            input: {
              sportType: "Bike",
              duration: 1800,
              distance: 20,
              heartRateMin: null,
              heartRateMax: null,
              heartRateAvg: null,
              cadence: null,
              power: null,
            },
          },
        },
        result: {
          data: {
            updateActivity: {
              id: "sa2",
              sportType: "Bike",
              duration: 1800,
              distance: 20,
            },
          },
        },
      };

      const addRunActivityMock = {
        request: {
          query: ADD_SESSION_ACTIVITY,
          variables: {
            sessionId: "ms1",
            sportType: "Run",
            duration: 900,
            distance: 5,
            heartRateMin: null,
            heartRateMax: null,
            heartRateAvg: null,
            cadence: null,
            power: null,
          },
        },
        result: {
          data: {
            createActivity: {
              id: "sa3",
              sportType: "Run",
              duration: 900,
              distance: 5,
            },
          },
        },
      };

      const updateTransitionT1Mock = {
        request: {
          query: UPDATE_TRANSITION_MUTATION,
          variables: {
            id: "t1",
            input: {
              previousSport: "Swim",
              nextSport: "Bike",
              transitionTime: 60,
              comments: "",
            },
          },
        },
        result: {
          data: {
            updateTransition: {
              id: "t1",
              previousSport: "Swim",
              nextSport: "Bike",
              transitionTime: 60,
              comments: "",
            },
          },
        },
      };

      const addTransitionMock = {
        request: {
          query: ADD_SESSION_TRANSITION,
          variables: {
            sessionId: "ms1",
            previousSport: "Bike",
            nextSport: "Run",
            transitionTime: 60,
            comments: "",
          },
        },
        result: {
          data: {
            createTransition: {
              id: "t2",
              previousSport: "Bike",
              nextSport: "Run",
              transitionTime: 60,
              comments: "",
            },
          },
        },
      };

      const { container } = render(
        <MockedProvider
          mocks={[
            updateSessionMock,
            updateSwimActivityMock,
            updateBikeActivityMock,
            addRunActivityMock,
            updateTransitionT1Mock,
            addTransitionMock,
            getSessionsMock,
          ]}
          addTypename={false}
        >
          <EditWholeSession session={sessionMulti as any} onClose={onClose} onUpdate={onUpdate} />
        </MockedProvider>
      );

      const activityCards = container.querySelectorAll(".activity-card");
      expect(activityCards.length).toBe(2);
      const swimCard = activityCards[0] as HTMLElement;
      const swimDistInput = getControlNextToLabel(swimCard, /^Distance \(m\)$/, "input");
      fireEvent.change(swimDistInput, { target: { value: "600" } });

      fireEvent.click(screen.getByRole("button", { name: "Add Activity" }));
      const updatedCards = container.querySelectorAll(".activity-card");
      const newRunCard = updatedCards[2] as HTMLElement;

      const runDistInput = getControlNextToLabel(newRunCard, /^Distance \(km\)$/, "input");
      fireEvent.change(runDistInput, { target: { value: "5" } });
      const minsInput = within(newRunCard).getByPlaceholderText("mm") as HTMLInputElement;
      fireEvent.change(minsInput, { target: { value: "15" } }); // 900s

      fireEvent.click(screen.getByRole("button", { name: "Add Transition" }));
      const transCards = container.querySelectorAll(".transition-card");
      expect(transCards.length).toBe(2);
      const newTrans = transCards[1] as HTMLElement;

      const prevSelect = getControlNextToLabel(newTrans, "Previous Sport", "select") as HTMLSelectElement;
      const nextSelect = getControlNextToLabel(newTrans, "Next Sport", "select") as HTMLSelectElement;
      fireEvent.change(prevSelect, { target: { value: "Bike" } });
      fireEvent.change(nextSelect, { target: { value: "Run" } });

      const transMin = getControlNextToLabel(newTrans, "Minutes", "input") as HTMLInputElement;
      const transSec = getControlNextToLabel(newTrans, "Seconds", "input") as HTMLInputElement;
      fireEvent.change(transMin, { target: { value: "1" } });
      fireEvent.change(transSec, { target: { value: "0" } });

      fireEvent.click(screen.getByRole("button", { name: "Save" }));

      await waitFor(() => {
        expect(onUpdate).toHaveBeenCalled();
        expect(onClose).toHaveBeenCalled();
      });
    });
  });
});
