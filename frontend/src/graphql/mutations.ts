import { gql } from '@apollo/client';

export const LOGIN_USER = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        name
        email
      }
    }
  }
`;

export const SIGNUP_USER = gql`
  mutation Signup($name: String!, $email: String!, $password: String!) {
    createUser(input: { name: $name, email: $email, password: $password }) {
      id
      name
      email
      created_at
    }
  }
`;


export const ADD_SESSION = gql`
  mutation AddSession(
    $sessionType: String!,
    $date: String!,
    $isMultiSport: Boolean!,
    $totalDuration: Int,
    $totalDistance: Float,
    $weatherTemp: Float,
    $weatherHumidity: Int,
    $weatherWindSpeed: Float
  ) {
    createSession(input: {
      sessionType: $sessionType,
      date: $date,
      isMultiSport: $isMultiSport,
      totalDuration: $totalDuration,
      totalDistance: $totalDistance,
      weatherTemp: $weatherTemp,
      weatherHumidity: $weatherHumidity,
      weatherWindSpeed: $weatherWindSpeed
    }) {
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
    }
  }
`;

export const ADD_SESSION_ACTIVITY = gql`
  mutation AddSessionActivity(
    $sessionId: ID!,
    $sportType: String!,
    $duration: Int!,
    $distance: Float!,
    $heartRateMin: Int,
    $heartRateMax: Int,
    $heartRateAvg: Int,
    $cadence: Int,
    $power: Int
  ) {
    createSessionActivity(input: {
      sessionId: $sessionId,
      sportType: $sportType,
      duration: $duration,
      distance: $distance,
      heartRateMin: $heartRateMin,
      heartRateMax: $heartRateMax,
      heartRateAvg: $heartRateAvg,
      cadence: $cadence,
      power: $power
    }) {
      id
      sessionId
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


export const DELETE_SESSION = gql`
  mutation DeleteSession($id: ID!) {
    deleteSession(id: $id) {
      message
    }
  }
`;

