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
    $totalDuration: Int!,
    $totalDistance: Float!,
    $isMultiSport: Boolean!,
    $weatherTemp: Float,
    $weatherHumidity: Int,
    $weatherWindSpeed: Float
  ) {
    createSession(input: {
      sessionType: $sessionType,
      date: $date,
      totalDuration: $totalDuration,
      totalDistance: $totalDistance,
      isMultiSport: $isMultiSport,
      weatherTemp: $weatherTemp,
      weatherHumidity: $weatherHumidity,
      weatherWindSpeed: $weatherWindSpeed
    }) {
      id
      sessionType
      date
      totalDuration
      totalDistance
      isMultiSport
      weatherTemp
      weatherHumidity
      weatherWindSpeed
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
