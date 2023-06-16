const NotificationTokenSchema = require('../models/notification');

 const SaveNotification = async ({userToken, user}) => {
  let notify = await NotificationTokenSchema.find({
    userId: user._id,
  });

  if (notify === null || !notify || notify.length === 0) {
    notify = await NotificationTokenSchema.create({
      userId: user._id,
      token: userToken,
    });
  } else if (notify && notify.length > 0) {
    const findToken = notify.find((c) => c.token === userToken);
    if (!findToken || findToken === undefined) {
      notify = await NotificationTokenSchema.updateOne(
        { userId: user._id },
        { token: userToken },
        { new: true }
      );
    }
  }
};

module.exports = SaveNotification