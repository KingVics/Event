const NotificationTokenSchema = require('../models/notification');

const SaveNotification = async ({ userToken, user, comId }) => {
  let notify = await NotificationTokenSchema.find({
    userId: user._id,
  });


  if (notify === null || !notify || notify.length === 0) {
    if (user.community.length > 0) {
      await NotificationTokenSchema.create({
        userId: user._id,
        token: notify?.token || userToken,
        community: user.community,
      });
    } else {
      await NotificationTokenSchema.create({
        userId: user._id,
        token: userToken,
      });
    }
  } else if (notify && notify.length > 0) {
    const findToken = notify.find((c) => c.token === userToken);
    if (!findToken || findToken === undefined) {
      if (user.community.length === 1 && !comId) {
        await NotificationTokenSchema.findOneAndUpdate(
          { userId: user._id },
          { token: userToken },
          { new: true }
        );
      } else {
        const findId =
          user.community.length > 0 &&
          comId &&
          user.community.find((c) => c.toString() === comId.toString());
        if ((findId !== undefined || findId !== null) && comId) {
          await NotificationTokenSchema.findOneAndUpdate(
            { userId: user._id },
            { $push: { community: comId } },
            { new: true }
          );
        } else {
          const findToken = notify.find((c) => c.token === userToken);
          if (userToken && (findToken === undefined || findToken === null)) {
            await NotificationTokenSchema.findOneAndUpdate(
              { userId: user._id },
              { token: userToken },
              { new: true }
            );
          } else {
            await NotificationTokenSchema.findOneAndUpdate(
              { userId: user._id },
              { token: notify[0]?.token },
              { new: true }
            );
          }
        }
      }
    } else {
      if (user.community.length > 1) {
        console.log('last');
      }
    }
  }
};

module.exports = SaveNotification;
