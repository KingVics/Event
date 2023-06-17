const User = require('../models/user');
const Community = require('../models/community');
const { BadRequestError, UnauthenticatedError } = require('../errors');
const { StatusCodes } = require('http-status-codes');
const SaveNotification = require('../middleware/SaveNotification');
const NotificationTokenSchema = require('../models/notification');

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

  SaveNotification({ user, userToken });

  res.status(StatusCodes.OK).json({ name: user.name, token });
};

const RegisterUser = async (req, res) => {
  const { community, userToken } = req.body;
  let comm = {};
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

  const token = user.CreateJWT();

  SaveNotification({ user, userToken });

  res.status(StatusCodes.CREATED).json({ name: user.name, token });
};



module.exports = {
  LoginUser,
  RegisterUser,
};
