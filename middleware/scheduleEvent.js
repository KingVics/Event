const schedule = require('node-schedule');
const sendNotification = require('./sendNotification');
const getReceipt = require('./getReceipt');
const { BadRequestError } = require('../errors');
const formDate = require('./formDate');
const { scheduledJobs, scheduleJob } = require('node-schedule');

const scheduleEvent = async ({ filteredToken, tData, eventId, userId }) => {
  const { year, day, month, minute, hour, seconds } = await formDate(
    tData.data
  );
  const date = new Date(year, month, day, hour, minute, seconds);

  let userJob = {};
  const key = `${userId}:${eventId}`;

  userJob.key = key;
  scheduleJob(userJob.key, date, async () => {
    sendNotification(filteredToken, tData, eventId)
      .then((ticket) => {
        getReceipt(ticket);
      })
      .catch((error) => {
        throw new BadRequestError('Event notification error');
      });
  });
};

module.exports = scheduleEvent;
