const { Expo } = require('expo-server-sdk');

const getReceipt = async (tickets) => {
  const expo = new Expo({ accessToken: process.env.ACCESS_TOKEN });

  let receiptIdChunks = expo.chunkPushNotificationReceiptIds([tickets]);

  let receipts;

  for (let chunk of receiptIdChunks) {
    try {
      receipts = await expo.getPushNotificationReceiptsAsync(chunk);
      // The receipts specify whether Apple or Google successfully received the
      // notification and information about an error, if one occurred.
      for (let receiptId in receipts) {
        let { status, message, details } = receipts[receiptId];
        if (status === 'ok') {
          continue;
        } else if (status === 'error') {
          console.error(
            `There was an error sending a notification: ${message}`,
            'error message'
          );
          if (details && details.error) {
            // The error codes are listed in the Expo documentation:
            // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
            // You must handle the errors appropriately.
            console.error(
              `The error code is ${details.error}`,
              'details error'
            );
          }
        }
      }
    } catch (error) {
      console.error(error);
    }
  }
};

module.exports = getReceipt;
