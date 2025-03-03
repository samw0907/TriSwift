import { gql } from '@apollo/client';

export const GET_SESSIONS = gql`
  query GetSessions {
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
      activities { # Add activities to query
        id
        sportType
        duration
        distance
        heartRateMin
        heartRateMax
        heartRateAvg
        cadence
        power
      }
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
