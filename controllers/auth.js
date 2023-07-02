const User = require('../models/user');
const Community = require('../models/community');
const { BadRequestError, UnauthenticatedError } = require('../errors');
const { StatusCodes } = require('http-status-codes');
const SaveNotification = require('../middleware/SaveNotification');
const NotificationTokenSchema = require('../models/notification');
const jwt = require('jsonwebtoken');

const LoginUser = async (req, res) => {
  const { email, password, userToken } = req.body;

  if (!email || !password) {
    throw new BadRequestError('Please provide email and password');
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new UnauthenticatedError('Invalid email or password');
  }

  const matchedpassword = await user.comparePassword(password);

  if (!matchedpassword) {
    throw new UnauthenticatedError('Invalid email or password');
  }

  const token = user.CreateJWT();
  const refreshToken = user.RefreshJWT();

  await User.findOneAndUpdate(
    { _id: user._id },
    { refreshToken },
    { new: true }
  );

  res.cookie('jwt', refreshToken, {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
  });
  SaveNotification({ user, userToken });

  res.status(StatusCodes.OK).json({ name: user.name, token });
};

const RegisterUser = async (req, res) => {
  const { community, userToken } = req.body;
  let comm = {};

  if (!userToken) {
    throw new BadRequestError('User device token is missing');
  }
  if (community) {
    comm = await Community.findOne({ referenceCode: community });

    if (comm === null || !comm._id) {
      throw new BadRequestError('No community found');
    }
  }
  const data = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    community: comm.createdBy,
  };
  const user = await User.create({ ...data });

  SaveNotification({ user, userToken });

  const token = user.CreateJWT();
  const refreshToken = user.RefreshJWT();

  await User.findOneAndUpdate(
    { _id: user._id },
    { refreshToken },
    { new: true }
  );

  res.cookie('jwt', refreshToken, {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
  });
  res.status(StatusCodes.CREATED).json({ name: user.name, token });
};

module.exports = {
  LoginUser,
  RegisterUser,
};
