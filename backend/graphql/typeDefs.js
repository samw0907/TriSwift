const { gql } = require("apollo-server-express");

const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    email: String!
    sessions: [Session]
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
  }

type PersonalRecord {
  id: ID!
  userId: ID!
  activityType: String!
  distance: Float
  bestTime: Int
  recordDate: String!
}

  type Progress {
    id: ID!
    userId: ID!
    activityType: String!
    achievedValue: Float
    date: String!
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
    duration: String
    distance: Float
    heartRateMin: Int
    heartRateMax: Int
    heartRateAvg: Int
    cadence: Int
    power: Int
  }

  input PersonalRecordInput {
    userId: ID!
    sportType: String!
    bestTime: Int
    maxPower: Int
  }

  input ProgressInput {
    userId: ID!
    activityType: String!
    achievedValue: Float
    date: String!
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
  }

  # Mutations
  type Mutation {
    createSession(input: SessionInput!): Session
    createSessionActivity(input: SessionActivityInput!): SessionActivity
    createPersonalRecord(input: PersonalRecordInput!): PersonalRecord
    createProgress(input: ProgressInput!): Progress
  }
`;

module.exports = typeDefs;
