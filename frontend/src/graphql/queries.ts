import { gql } from '@apollo/client';

export const GET_SESSIONS = gql`
  query GetWorkouts {
    sessions {
      id
      session_type
      date
      total_duration
      total_distance
      weather_temp
      weather_humidity
      weather_wind_speed
      created_at
      updated_at
    }
  }
`;

export const GET_PERSONAL_RECORDS = gql`
  query GetPersonalRecords($sportType: String!) {
    personalRecords(sportType: $sportType) {
      distance
      best_time
      record_date
    }
  }
`;
