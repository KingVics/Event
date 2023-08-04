const schedule = require( 'node-schedule');

const cancelEvent = async ({ eventId, userId }) => {
  let userJob = {};
  const key = `${userId}:${eventId}`;

  userJob.key = key;
  let jobs = schedule.scheduledJobs[userJob.key.toString()];
  if (jobs) {
    jobs.cancel();
  }
};

module.exports = cancelEvent;
