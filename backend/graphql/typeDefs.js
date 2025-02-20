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
  
  input TransitionInput {
    session_id: ID!
    previous_sport: String!
    next_sport: String!
    transition_time: Int!
    comments: String
  }

  input PersonalRecordInput {
    userId: ID!
    activityType: String!  
    distance: Float
    bestTime: Int!
    maxPower: Int
  }

  # Input for User Creation
  input CreateUserInput {
    name: String!
    email: String!
    password: String!
  }

  # Queries
  type Query {
    users: [User]
    user(id: ID!): User 
    sessions(userId: ID): [Session!]! 
    session(id: ID!): Session
    sessionActivities(sessionId: ID!): [SessionActivity]
    personalRecords(userId: ID!): [PersonalRecord]
    progress(userId: ID!): [Progress]
    transitions(sessionId: ID!): [Transition]
  }

  # Mutations
  type Mutation {
    createSession(input: SessionInput!): Session
    createSessionActivity(input: SessionActivityInput!): SessionActivity
    createTransition(input: TransitionInput!): Transition
    createPersonalRecord(input: PersonalRecordInput!): PersonalRecord
    createProgress(input: ProgressInput!): Progress
    createUser(input: CreateUserInput!): User  # New Mutation for creating users
  }
`;

module.exports = typeDefs;
