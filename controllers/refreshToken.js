const { NotFoundError, UnauthenticatedError } = require('../errors');
const { StatusCodes } = require('http-status-codes');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

const RefreshToken = async (req, res) => {
  const cookie = req?.cookies?.jwt;

  if (!cookie) {
    throw new UnauthenticatedError('Unauthorized access');
  }


  const refreshToken = cookie;
  const user = await User.findOne({ refreshToken });

  if (!user) {
    throw new UnauthenticatedError('Invalid email or password');
  }

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN, (err, decoded) => {
    if (err || user.name !== decoded.name)
      throw new NotFoundError('Refresh token not found');

    const token = jwt.sign(
      { userId: decoded.userId, name: decoded.name },
      process.env.JWT_SECRET,
      {
        expiresIn: '1m',
      }
    );
    res.status(StatusCodes.CREATED).json({ name: user.name, token });
  });
};

module.exports = RefreshToken;
