const { Expo } = require('expo-server-sdk');
const NotificationTokenSchema = require('../models/notification');
const Event = require('../models/event');

const sendNotification = async (expoPushToken, data, eventId) => {
  const expo = new Expo({ accessToken: process.env.ACCESS_TOKEN });

  const tokens = expoPushToken.map((item) => ({
    to: item.token,
    sound: 'default',
    title: data.title,
    body: data.body,
    badge: 1,
  }));

  const chunks = expo.chunkPushNotifications(tokens);
  const tickets = [];

  for (const chunk of chunks) {
    try {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    } catch (error) {
      console.error(error);
    }
  }

  let response = '';

  for (const ticket of tickets) {
    if (ticket.status === 'error') {
      if (ticket.details && ticket.details.error === 'DeviceNotRegistered') {
        await NotificationTokenSchema.findOneAndDelete({
          token: ticket.details.expoPushToken,
        });
        response = 'DeviceNotRegistered';
      }
    }

    if (ticket.status === 'ok') {
      await Event.findOneAndUpdate(
        { _id: eventId },
        { expired: true },
        { new: true }
      );
      response = ticket.id;
    }
  }

  return response;
};

module.exports = sendNotification;
