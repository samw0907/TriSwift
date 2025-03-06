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
    isMultiSport: Boolean!
    totalDuration: Int
    totalDistance: Float
    activities: [SessionActivity!]!
    transitions: [Transition!]! @deprecated(reason: "Only applicable for multi-sport sessions") 
    weatherTemp: Float
    weatherHumidity: Int
    weatherWindSpeed: Float
    created_at: String!
    updated_at: String!
  }

  type SessionActivity {
    id: ID!
    userId: ID!
    sessionId: ID!
    sportType: String!
    duration: Int!
    distance: Float!
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
    previousSport: String
    nextSport: String
    transitionTime: Int!
    comments: String
    created_at: String!
    updated_at: String!
  }

  type PersonalRecord {
    id: ID!
    userId: ID!
    sessionId: ID!
    sessionActivityId: ID!
    activityType: String!
    distance: Float!
    bestTime: Int!
    recordDate: String!
    created_at: String!
    updated_at: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  # Input Types for Mutations

  input SessionInput {
    sessionType: String!
    date: String!
    isMultiSport: Boolean!
    totalDuration: Int
    totalDistance: Float
    weatherTemp: Float
    weatherHumidity: Int
    weatherWindSpeed: Float
  }

  input UpdateSessionInput {
    sessionType: String
    date: String
    isMultiSport: Boolean
    totalDuration: Int
    totalDistance: Float
    weatherTemp: Float
    weatherHumidity: Int
    weatherWindSpeed: Float
  }

  input SessionActivityInput {
    sessionId: ID!
    sportType: String!
    duration: Int!
    distance: Float
    heartRateMin: Int
    heartRateMax: Int
    heartRateAvg: Int
    cadence: Int
    power: Int
  }

  input UpdateSessionActivityInput {
    sportType: String
    duration: Int!
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
    sessionId: ID! 
    sessionActivityId: ID!
    activityType: String!
    distance: Float
    bestTime: Int!
    recordDate: String
  }

  input UpdatePersonalRecordInput {
    sessionId: ID!
    sessionActivityId: ID!
    activityType: String!
    distance: Float
    bestTime: Int!
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
    currentUser: User
    users: [User]
    user: User
    sessions: [Session!]! 
    session(id: ID!): Session
    sessionActivities(sessionId: ID!): [SessionActivity!]!
    personalRecords(sportType: String!): [PersonalRecord!]!
    transitions(sessionId: ID!): [Transition!]!
  }

  # Mutations
  type Mutation {
    login(email: String!, password: String!): AuthPayload

    createSession(input: SessionInput!): Session
    createSessionActivity(input: SessionActivityInput!): SessionActivity
    createTransition(input: TransitionInput!): Transition
    createOrUpdatePersonalRecords(sessionActivityId: ID!): [PersonalRecord!]!
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
