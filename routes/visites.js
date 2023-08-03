var express = require("express");
var router = express.Router();
const mongoose = require("mongoose");

const moment = require("moment");
const { extendMoment } = require("moment-range");
const extendedMoment = extendMoment(moment);

const Disponibilites = require("../models/disponibilites");
const Visite = require("../models/visites");

// Endpoint pour gérer la création de rendez-vous
router.post("/", (req, res) => {
  const { prosId, usersId, dateOfVisit, startTimeVisit, duration, bienImmoId } =
    req.body;

  //création d'une constante pour le endTimeVisit qui est le StartTime + duration de la visite
  const endTimeVisit = moment(startTimeVisit, "HH:mm")
    .add(duration, "minutes")
    .format("HH:mm");

  //création d'une constante pour le jour de la semaine
  const dayOfWeek = moment(dateOfVisit).locale("fr").format("dddd");
  console.log("dayOfWeek: ", dayOfWeek);
  console.log("dateOfVisit: ", dateOfVisit);
  console.log("prosId: ", prosId);


  // Vérifier si le pro est disponible
  Disponibilites.findOne({
    pro: prosId,
    dayOfWeek: dayOfWeek,
    startTimeDispo: { $lte: startTimeVisit },
    endTimeDispo: { $gte: endTimeVisit },
    "Exception.dateOfVisit": dateOfVisit,
    "Exception.startTimeVisit": { $ne: startTimeVisit },
    "Exception.endTimeVisit": { $ne: endTimeVisit },
  }).then((data) => {
    if (data) {
      console.log("infos dispo: ", data);
      console.log("exception.date: ", data.Exception.dateOfVisit);

      const newVisit = new Visite({
        prosId: prosId,
        usersId: usersId,
        dateOfVisit: dateOfVisit,
        startTimeVisit: startTimeVisit,
        endTimeVisit: endTimeVisit,
        duration: duration,
        statut: "en attente",
        bienImmoId: bienImmoId,
      });
      newVisit.save().then((newVisit) => {
        res.json({
          message: "Rendez-vous créé avec succès.",
          result: true,
          newVisit: newVisit,
        });
      });
      data.Exception.push({
        dateOfVisit: dateOfVisit,
        startTimeVisit: startTimeVisit,
        endTimeVisit: endTimeVisit,
        duration: duration,
      });
      data.save();
      console.log("data.Exception: ", data.Exception);
    } else {
      res.json({
        message: "Le pro n'est pas disponible à ce moment-là.",
        result: false,
      });
    }
  });
});

//création de la route pour récupérer les visites d'un pro
router.get("/pro/:prosId", (req, res) => {
  // Vérifier si l'id du professionnel est valide
  if (!mongoose.Types.ObjectId.isValid(req.params.prosId)) {
    return res.json({ message: "L'id du professionnel n'est pas valide." });
  }

  Visite.find({ prosId: req.params.prosId })
    .populate("usersId")
    .populate("bienImmoId")
    .then((data) => {
      if (data.length > 0) {
        res.json({ VisitesTrouvees: data, result: true });
      } else {
        res.json({
          message: "Pas de visites trouvées pour ce pro",
          result: false,
        });
      }
    });
});

//création d'une route pour récupérer les visites d'un user
router.get("/user/:usersId", (req, res) => {
  // Vérifier si l'id du user est valide
  if (!mongoose.Types.ObjectId.isValid(req.params.usersId)) {
    return res.json({ message: "L'id du user n'est pas valide." });
  }

  Visite.find({ usersId: req.params.usersId })
    .populate("prosId")
    .populate("bienImmoId")
    .then((data) => {
      if (data.length > 0) {
        console.log("data", data);
        res.json({ VisitesTrouvees: data, result: true });
      } else {
        res.json({
          message: "Pas de visites trouvées pour ce user",
          result: false,
        });
      }
    });
});

//création d'une route pour supprimer une visite

module.exports = router;
