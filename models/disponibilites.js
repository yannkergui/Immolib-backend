const mongoose = require('mongoose');

const ExceptionSchema = mongoose.Schema({
  dateOfVisit: String,
  startTimeVisit: String,
  endTimeVisit: String,
  duration: Number,
});

const disponibilitesSchema = mongoose.Schema({
  dayOfWeek: String,
  startTimeDispo: String,
  endTimeDispo: String,
  pro: {type: mongoose.Schema.Types.ObjectId, ref: 'pros'},
  Exception : [ExceptionSchema]
});

const Disponibilites = mongoose.model('disponibilites', disponibilitesSchema);

module.exports = Disponibilites;