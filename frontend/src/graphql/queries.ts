import { gql } from '@apollo/client';

export const GET_SESSIONS = gql`
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

export const GET_PERSONAL_RECORDS = gql`
  query GetPersonalRecords($sportType: String!) {
    personalRecords(sportType: $sportType) {
      distance
      bestTimes
    }
  }
`;
