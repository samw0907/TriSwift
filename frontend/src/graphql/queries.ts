import { gql } from '@apollo/client';

export const GET_WORKOUTS = gql`
  query GetWorkouts {
    sessions {
      id
      sessionType
      date
      totalDuration
      totalDistance
      weatherTemp
      weatherHumidity
      weatherWindSpeed
      created_at
      updated_at
    }
  }
`;

export {};
