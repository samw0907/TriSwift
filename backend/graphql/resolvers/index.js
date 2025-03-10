const activityResolvers = require("./activityResolvers");
const authResolvers = require("./authResolver");
const personalRecordResolvers = require("./personalRecordResolvers");
const sessionResolvers = require("./sessionResolvers");
const transitionResolvers = require("./transitionsResolvers");
const userResolvers = require("./userResolvers");

module.exports = [
  activityResolvers,
  authResolvers,
  personalRecordResolvers,
  sessionResolvers,
  transitionResolvers,
  userResolvers
];
