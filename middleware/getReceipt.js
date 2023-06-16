const { Expo } = require('expo-server-sdk');

const getReceipt = async (receiptId) => {
  const expo = new Expo({ accessToken: process.env.ACCESS_TOKEN });

  let receiptIdChunks = expo.chunkPushNotificationReceiptIds([receiptId]);

  let receipt;

  for (const chunk of receiptIdChunks) {
    try {
      receipt = await expo.getPushNotificationReceiptsAsync(chunk);
    } catch (error) {
      console.error(error);
    }
  }

  return receipt ? receipt[receiptId] : null;
};

module.exports = getReceipt;
