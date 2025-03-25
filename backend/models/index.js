const User = require("./User.js");
const Session = require("./Session.js");
const SessionActivity = require("./SessionActivity.js");
const Transition = require("./Transition.js");
const PersonalRecord = require("./PersonalRecord.js");

User.hasMany(Session, { 
  foreignKey: "user_id", 
  onDelete: "CASCADE" 
});
Session.belongsTo(User, { 
  foreignKey: "user_id" 
});

Session.hasMany(SessionActivity, { 
  foreignKey: "session_id", 
  onDelete: "CASCADE",
  as: "activities"
});
SessionActivity.belongsTo(Session, { 
  foreignKey: "session_id",
  as: "session"
});

Session.hasMany(Transition, { 
  foreignKey: "session_id", 
  onDelete: "CASCADE",
  as: "transitions"
});
Transition.belongsTo(Session, { 
  foreignKey: "session_id",
  as: "session"
});

User.hasMany(SessionActivity, { 
  foreignKey: "user_id", 
  onDelete: "CASCADE" 
});
SessionActivity.belongsTo(User, { 
  foreignKey: "user_id" 
});

User.hasMany(PersonalRecord, { 
  foreignKey: "user_id", 
  onDelete: "CASCADE" 
});
PersonalRecord.belongsTo(User, { 
  foreignKey: "user_id" 
});


SessionActivity.hasMany(PersonalRecord, { 
  foreignKey: "session_activity_id", 
  onDelete: "CASCADE",
  as: "records"
});
PersonalRecord.belongsTo(SessionActivity, { 
  foreignKey: "session_activity_id",
  as: "sessionActivity"
});

module.exports = {
  User,
  Session,
  SessionActivity,
  Transition,
  PersonalRecord,
};
