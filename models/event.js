const mongoose = require('mongoose');

const EventSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide event name'],
      maxlength: 50,
      unique: true,
    },
    eventDate: {
      type: Date,
      required: [true, 'Please provide date to the event'],
    },
    reminderDate: {
      type: Date,
      required: [true, 'Please provide reminder date'],
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide a user'],
    },
    community: {
      type: mongoose.Types.ObjectId,
      ref: 'Community',
      required: [true, 'Please provide a community'],
    },
  },
  { timestamp: true }
);

module.exports = mongoose.model('Event', EventSchema);
