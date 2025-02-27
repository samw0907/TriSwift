import { gql } from '@apollo/client';

export const LOGIN_USER = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      token
    }
  }
`;

export const ADD_WORKOUT = gql`
  mutation AddWorkout($session_type: String!, $date: String!, $total_duration: Int!, $total_distance: Float!) {
    addWorkout(session_type: $session_type, date: $date, total_duration: $total_duration, total_distance: $total_distance) {
      id
      session_type
      date
      total_duration
      total_distance
    }
  }
`;

export {};
