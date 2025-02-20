const User = require("./user");
const Session = require("./session");
const SessionActivity = require("./sessionActivity");
const Transition = require("./transition");
const PersonalRecord = require("./personalRecord");

User.hasMany(Session, { foreignKey: "user_id", onDelete: "CASCADE" });
Session.belongsTo(User, { foreignKey: "user_id" });

Session.hasMany(SessionActivity, { foreignKey: "session_id", onDelete: "CASCADE" });
SessionActivity.belongsTo(Session, { foreignKey: "session_id" });

Session.hasMany(Transition, { foreignKey: "session_id", onDelete: "CASCADE" });
Transition.belongsTo(Session, { foreignKey: "session_id" });

User.hasMany(PersonalRecord, { foreignKey: "user_id", onDelete: "CASCADE" });
PersonalRecord.belongsTo(User, { foreignKey: "user_id" });

module.exports = {
  User,
  Session,
  SessionActivity,
  Transition,
  PersonalRecord,
};
