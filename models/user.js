const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    maxlength: 50,
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      'Please provide a valid email',
    ],
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'Please provide password'],
    minlength: 6,
  },
  // community: {
  //   type: mongoose.Types.ObjectId,
  //   ref: 'Community',
  //   // require: [true, 'Please provide a user'],
  // },
  community: [mongoose.Types.ObjectId],
  refreshToken: {
    type: String,
    // required: [true, 'Please provide refresh token']
  },
});

User.pre('save', async function (next) {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  next();
});

User.methods.CreateJWT = function () {
  return jwt.sign(
    { userId: this._id, name: this.name },
    process.env.JWT_SECRET,
    {
      expiresIn: '5m',
    }
  );
};

User.methods.RefreshJWT = function () {
  return jwt.sign(
    { userId: this._id, name: this.name },
    process.env.REFRESH_TOKEN,
    {
      expiresIn: '1d',
    }
  );
};
User.methods.comparePassword = async function (canditatePassword) {
  const isMatch = await bcrypt.compare(canditatePassword, this.password);
  return isMatch;
};

module.exports = mongoose.model('User', User);
