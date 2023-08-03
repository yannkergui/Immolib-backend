const mongoose = require("mongoose");

const visiteSchema = new mongoose.Schema({
  prosId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "pros",
    required: true,
  },
  usersId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  startTimeVisit: {
    type: String,
    required: true,
  },
  endTimeVisit: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  statut: {
    type: String,
    enum: ["en attente", "confirmé", "annulé"],
    default: "en attente",
  },
  bienImmoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "biens",
    required: true,
  },
});

const Visite = mongoose.model("visites", visiteSchema);

module.exports = Visite;
