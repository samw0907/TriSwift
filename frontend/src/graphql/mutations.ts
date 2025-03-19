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

export const ADD_SESSION_TRANSITION = gql`
  mutation AddSessionTransition(
    $sessionId: ID!,
    $previousSport: String!,
    $nextSport: String!,
    $transitionTime: Int!,
    $comments: String
  ) {
    createTransition(input: {
      sessionId: $sessionId,
      previousSport: $previousSport,
      nextSport: $nextSport,
      transitionTime: $transitionTime,
      comments: $comments
    }) {
      id
      sessionId
      previousSport
      nextSport
      transitionTime
      comments
      created_at
      updated_at
    }
  }
`;

export const UPDATE_SESSION = gql`
  mutation UpdateSession($id: ID!, $input: UpdateSessionInput!) {
    updateSession(id: $id, input: $input) {
      id
      sessionType
      date
      weatherTemp
      weatherHumidity
      weatherWindSpeed
      updated_at
    }
  }
`;

export const UPDATE_SESSION_ACTIVITY = gql`
  mutation UpdateSessionActivity($id: ID!, $input: UpdateSessionActivityInput!) {
    updateSessionActivity(id: $id, input: $input) {
      id
      sportType
      duration
      distance
      heartRateMin
      heartRateMax
      heartRateAvg
      cadence
      power
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

export const DELETE_ACTIVITY_MUTATION = gql`
  mutation DeleteSessionActivity($id: ID!) {
    deleteSessionActivity(id: $id) {
      message
    }
  }
`;