// const sendNotification = require('./sendNotification');
// const getReceipt = require('./getReceipt');
// const { BadRequestError } = require('../errors');
const formDate = require('./formDate');
const schedule = require('node-schedule');

const RescheduleEvent = async ({ token, tData, eventId, userId }) => {
  const { year, day, month, minute, hour, seconds } = await formDate(
    tData.data
  );
  const date = new Date(year, month, day, hour, minute, seconds);

  let userJob = {};
  const key = `${userId}:${eventId}`;
  userJob.key = key;
  let jobs = schedule.scheduledJobs[userJob.key.toString()];
  if (jobs) {
    jobs.reschedule(date);
  }
};

module.exports = RescheduleEvent;
