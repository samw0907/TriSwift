const { gql } = require("apollo-server-express");

const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    email: String!
    sessions: [Session]
    created_at: String!
    updated_at: String!
  }

  type Session {
    id: ID!
    userId: ID!
    sessionType: String!
    date: String!
    totalDuration: Int!
    totalDistance: Float!
    weatherTemp: Float
    weatherHumidity: Int
    weatherWindSpeed: Float
    activities: [SessionActivity]
    created_at: String!
    updated_at: String!
  }

  type SessionActivity {
    id: ID!
    sessionId: ID!
    sportType: String!
    duration: Int
    distance: Float
    heartRateMin: Int
    heartRateMax: Int
    heartRateAvg: Int
    cadence: Int
    power: Int
    created_at: String!
    updated_at: String!
  }

  type Transition {
    id: ID!
    sessionId: ID!
    previousSport: String!
    nextSport: String!
    transitionTime: Int!
    comments: String
    created_at: String!
    updated_at: String!
  }

  type PersonalRecord {
    id: ID!
    userId: ID!
    activityType: String!
    distance: Float
    bestTime: Int
    recordDate: String!
    created_at: String!
    updated_at: String!
  }

    type AuthPayload {
    token: String!
  }

  # Input Types for Mutations

  input SessionInput {
    sessionType: String!
    date: String!
    totalDuration: Int!
    totalDistance: Float!
    weatherTemp: Float
    weatherHumidity: Int
    weatherWindSpeed: Float
  }

  input UpdateSessionInput {
    sessionType: String
    date: String
    totalDuration: Int
    totalDistance: Float
    weatherTemp: Float
    weatherHumidity: Int
    weatherWindSpeed: Float
  }

  input SessionActivityInput {
    sessionId: ID!
    sportType: String!
    duration: Int
    distance: Float
    heartRateMin: Int
    heartRateMax: Int
    heartRateAvg: Int
    cadence: Int
    power: Int
  }

  input UpdateSessionActivityInput {
    sportType: String
    duration: Int
    distance: Float
    heartRateMin: Int
    heartRateMax: Int
    heartRateAvg: Int
    cadence: Int
    power: Int
  }
  
  input TransitionInput {
    sessionId: ID!
    previousSport: String!
    nextSport: String!
    transitionTime: Int!
    comments: String
  }

  input UpdateTransitionInput {
    previousSport: String
    nextSport: String
    transitionTime: Int
    comments: String
  }

  input PersonalRecordInput {
    activityType: String!  
    distance: Float
    bestTime: Int!
    maxPower: Int
  }

  input UpdatePersonalRecordInput {
    activityType: String
    distance: Float
    bestTime: Int
    recordDate: String
  }

  input CreateUserInput {
    name: String!
    email: String!
    password: String!
  }
  
  input UpdateUserInput {
    name: String
    email: String
    password: String
  }

  # Queries
  type Query {
    users: [User] # Returns the logged-in user only
    user: User # Fetches logged-in user's details
    sessions: [Session!]! 
    session(id: ID!): Session
    sessionActivities(sessionId: ID!): [SessionActivity]
    personalRecords: [PersonalRecord]
    transitions(sessionId: ID!): [Transition]
  }

  # Mutations
  type Mutation {
    login(email: String!, password: String!): AuthPayload

    createSession(input: SessionInput!): Session
    createSessionActivity(input: SessionActivityInput!): SessionActivity
    createTransition(input: TransitionInput!): Transition
    createPersonalRecord(input: PersonalRecordInput!): PersonalRecord
    createUser(input: CreateUserInput!): User

    updateSession(id: ID!, input: UpdateSessionInput!): Session
    updateSessionActivity(id: ID!, input: UpdateSessionActivityInput!): SessionActivity
    updateTransition(id: ID!, input: UpdateTransitionInput!): Transition
    updatePersonalRecord(id: ID!, input: UpdatePersonalRecordInput!): PersonalRecord
    updateUser(id: ID!, input: UpdateUserInput!): User

    deleteSession(id: ID!): MessageResponse
    deleteSessionActivity(id: ID!): MessageResponse
    deleteTransition(id: ID!): MessageResponse
    deletePersonalRecord(id: ID!): MessageResponse
    deleteUser(id: ID!): MessageResponse
  }

  type MessageResponse {
    message: String!
  }
`;

module.exports = typeDefs;
