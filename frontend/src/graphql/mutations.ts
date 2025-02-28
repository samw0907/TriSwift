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
    $totalDistance: Float!
  ) {
    createSession(input: {
      session_type: $sessionType,
      date: $date,
      total_duration: $totalDuration,
      total_distance: $totalDistance
    }) {
      id
      session_type
      date
      total_duration
      total_distance
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
