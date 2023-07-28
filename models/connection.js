const mongoose = require('mongoose');

const MONGO_DB = process.env.MONGO_DB;


mongoose.connect(MONGO_DB, { connectTimeoutMS: 2000 })
  .then(() => console.log('Database connected'))
  .catch(error => console.error(error));
