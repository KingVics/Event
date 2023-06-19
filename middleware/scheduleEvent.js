const schedule = require('node-schedule');
const sendNotification = require('./sendNotification');
const getReceipt = require('./getReceipt');
const { BadRequestError } = require('../errors');
const formDate = require('./formDate');

const scheduleEvent = async ({ token, tData }) => {
  const { year, day, month, minute, hour } = await formDate(tData.data);

  const date = new Date(year, month, day, hour, minute, 0);
  const job = schedule.scheduleJob(date, function () {
    console.log('The world is going to end today.');
    sendNotification(token, tData)
      .then((ticket) => {
        getReceipt(ticket);
      })
      .catch((error) => {
        throw new BadRequestError('Event notification error');
      });
  });
};

module.exports = scheduleEvent;
