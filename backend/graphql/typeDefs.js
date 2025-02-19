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
    sportType: String!
    bestTime: Int
    maxPower: Int
  }

  type Progress {
    id: ID!
    userId: ID!
    activityType: String!
    achievedValue: Float
    date: String!
  }

  # Input Types for Mutations
  input sessionInput {
    userId: ID!
    sessionType: String!
    date: String!
    totalDuration: Int!
    totalDistance: Float!
    weatherTemp: Float
    weatherHumidity: Int
    weatherWindSpeed: Float
  }

  input sessionActivityInput {
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

  input personalRecordInput {
    userId: ID!
    sportType: String!
    bestTime: Int
    maxPower: Int
  }

  input progressInput {
    userId: ID!
    activityType: String!
    achievedValue: Float
    date: String!
  }

  # Queries
  type Query {
    users: [User]
    sessions: [Session]
    session(id: ID!): Session
    sessionActivities(sessionId: ID!): [SessionActivity]
    personalRecords(userId: ID!): [PersonalRecord]
    progress(userId: ID!): [Progress]
  }

  # Mutations
  type Mutation {
    createSession(input: sessionInput!): Session
    createSessionActivity(input: sessionActivityInput!): SessionActivity
    createPersonalRecord(input: personalRecordInput!): PersonalRecord
    createProgress(input: progressInput!): Progress
  }
`;

module.exports = typeDefs;
