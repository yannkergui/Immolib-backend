const mongoose = require('mongoose');

const disponibilitesSchema = mongoose.Schema({
  dayOfWeek: String,
  startTime: String,
  endTime: String,
  pro: {type: mongoose.Schema.Types.ObjectId, ref: 'pros'},
});

const Disponibilites = mongoose.model('disponibilites', disponibilitesSchema);

module.exports = Disponibilites;