const mongoose = require('mongoose');

const Community = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide name of community'],
      maxlength: 50,
      unique: true,
    },
    referenceCode: {
      type: String,
      unique: true,
      required: [true],
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide a user'],
    },
  },
  { timestamps: true }
);



module.exports = mongoose.model('Community', Community);
