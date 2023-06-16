const mongoose = require('mongoose');

const NotificationTokenSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    token: {
      type: String,
      required: [true, 'token is required'],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  'NotificationTokenSchema',
  NotificationTokenSchema
);
