import { gql } from '@apollo/client';

export const GET_WORKOUTS = gql`
  query GetWorkouts {
    workouts {
      id
      session_type
      date
      total_duration
      total_distance
      weather_temp
      weather_humidity
      weather_wind_speed
    }
  }
`;

export {};
