import { gql } from '@apollo/client';

export const LOGIN_USER = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
    }
  }
`;

export const SIGNUP_USER = gql`
  mutation Signup($name: String!, $email: String!, $password: String!) {
    createUser(input: { name: $name, email: $email, password: $password }) {
      id
      name
      email
    }
  }
`;

export const ADD_SESSION = gql`
  mutation AddSession($sessionType: String!, $date: String!, $totalDuration: Int!, $totalDistance: Float!) {
    createSession(input: {
      sessionType: $sessionType, 
      date: $date, 
      totalDuration: $totalDuration, 
      totalDistance: $totalDistance
    }) {
      id
      sessionType
      date
      totalDuration
      totalDistance
      created_at
      updated_at
    }
  }
`;