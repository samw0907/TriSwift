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
    duration: String
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
    session_id: ID!
    previous_sport: String!
    next_sport: String!
    transition_time: Int!
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

  # Input Types for Mutations (FIXED PascalCase)
  input SessionInput {
    userId: ID!
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
    session_id: ID!
    previous_sport: String!
    next_sport: String!
    transition_time: Int!
    comments: String
  }

  input UpdateTransitionInput {
    previousSport: String
    nextSport: String
    transitionTime: Int
    comments: String
  }

  input PersonalRecordInput {
    userId: ID!
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
    users: [User]
    user(id: ID!): User 
    sessions(userId: ID): [Session!]! 
    session(id: ID!): Session
    sessionActivities(sessionId: ID!): [SessionActivity]
    personalRecords(userId: ID!): [PersonalRecord]
    transitions(sessionId: ID!): [Transition]
  }

  # Mutations
  type Mutation {
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
