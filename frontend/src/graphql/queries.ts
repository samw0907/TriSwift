import { gql } from '@apollo/client';

export const GET_SESSIONS = gql`
  query GetSessions {
    sessions {
      id
      sessionType
      date
      isMultiSport
      totalDuration
      totalDistance
      weatherTemp
      weatherHumidity
      weatherWindSpeed
      created_at
      updated_at
activities { 
  id
  sportType
  duration
  distance
  heartRateMin
  heartRateMax
  heartRateAvg
  cadence
  power
  created_at
  updated_at
}
transitions @skip(if: false) {
  id
  previousSport
  nextSport
  transitionTime
  comments
  created_at
  updated_at
    }
  }
}
`;

export const GET_SESSION_ACTIVITIES = gql`
  query GetSessionActivities($sessionId: ID!) {
    sessionActivities(sessionId: $sessionId) {
      id
      sportType
      duration
      distance
      heartRateMin
      heartRateMax
      heartRateAvg
      cadence
      power
      created_at
      updated_at
    }
  }
`;

export const GET_SESSION_TRANSITIONS = gql`
  query GetSessionTransitions($sessionId: ID!) {
    transitions(sessionId: $sessionId) {
      id
      previousSport
      nextSport
      transitionTime
      comments
      created_at
      updated_at
    }
  }
`;

export const GET_PERSONAL_RECORDS = gql`
  query GetPersonalRecords($sportType: String!) {
    personalRecords(sportType: $sportType) {
      id
      userId
      sessionId
      sessionActivityId
      activityType
      distance
      bestTime
      recordDate 
      created_at
      updated_at
    }
  }
`;

