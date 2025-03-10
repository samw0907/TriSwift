const { PersonalRecord } = require("../../models");

const personalRecordResolvers = {
  Query: {
    personalRecords: async (_, { sportType }, { user }) => {
        if (!user) throw new Error("Authentication required.");
  
        const records = await PersonalRecord.findAll({
          where: { user_id: user.id, activity_type: sportType },
          order: [["distance", "ASC"], ["best_time", "ASC"]],
        });
  
        const uniqueRecords = new Map();
        records.forEach(record => {
          if (!uniqueRecords.has(record.distance)) {
            uniqueRecords.set(record.distance, []);
          }
          if (uniqueRecords.get(record.distance).length < 3) {
            uniqueRecords.get(record.distance).push(record);
          }
        });
  
        return Array.from(uniqueRecords.values()).flat().map(record => ({
          id: record.id,
          userId: record.user_id,
          sessionId: record.session_id,
          sessionActivityId: record.session_activity_id,
          activityType: record.activity_type,
          distance: record.distance,
          bestTime: record.best_time,
          recordDate: record.record_date ? record.record_date.toISOString() : null,
          created_at: record.created_at.toISOString(),
          updated_at: record.updated_at.toISOString(),
        }));
      },
  }
}

module.exports = personalRecordResolvers;
