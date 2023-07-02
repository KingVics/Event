require('dotenv').config();
require('express-async-errors');
const connectDb = require('./db/connect');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser')
const Whitelist = require('./middleware/whitelist');
const authRoute = require('./routes/auth');
const commRoute = require('./routes/community');
const userRoute = require('./routes/user');
const eventRoute = require('./routes/event');
const refreshRoute = require('./routes/refreshToken')
const auth = require('./middleware/authentication');
const mongoose = require('mongoose');
const app = express();

//Error handler
const notFoundMiddleware = require('./middleware/notFound');
const errorHandlerMiddleware = require('./middleware/error-handler');

const corsOptions = {
  origin: (origin, callback) => {
    if (Whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  optionsSuccessStatus: 200,
};
app.use(cors());
app.use(express.json());
app.use(cookieParser())
app.get('/', (req, res) => {
  res.send('Welcome onboard');
});

app.use(express.json());

// Routes
app.use('/api/v1/auth', authRoute);
app.use('/api/v1/refresh', refreshRoute);
app.use('/api/v1/community', auth, commRoute);
app.use('/api/v1/users', auth, userRoute);
app.use('/api/v1/events', auth, eventRoute);

//Middleware
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDb(process.env.MONGO_URI);

    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
    // const collections = await mongoose.connection.db.collections();
    // for (let collection of collections) {
    //   await collection.deleteMany({});
    // }
  } catch (error) {
    console.log(error);
  }
};

start();
