const activityResolvers = require("./activityResolvers");
const authResolvers = require("./authResolvers");
const personalRecordsResolvers = require("./personalRecordsResolvers");
const sessionResolvers = require("./sessionResolvers");
const transitionResolvers = require("./transitionResolvers");
const userResolvers = require("./userResolvers");

module.exports = [
  activityResolvers,
  authResolvers,
  personalRecordsResolvers,
  sessionResolvers,
  transitionResolvers,
  userResolvers
];
