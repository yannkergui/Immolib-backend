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
  const { prosId, usersId, date, startTimeVisit, duration, bienImmoId } =
    req.body;

  //création d'une constante pour le endTimeVisit qui est le StartTime + duration de la visite
  const endTimeVisit = moment(startTimeVisit, "HH:mm")
    .add(duration, "minutes")
    .format("HH:mm");

  // Vérifier si le pro est disponible
  Disponibilites.findOne({
    pro: prosId,
    dayOfWeek: date,
    startTimeDispo: { $lte: startTimeVisit },
    endTimeDispo: { $gte: endTimeVisit },
  }).then((data) => {
    if (data) {
      console.log("infos dispo: ", data);

      const newVisit = new Visite({
        prosId: prosId,
        usersId: usersId,
        date: date,
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
    } else {
      res.json({
        message: "Le pro n'est pas disponible à ce moment-là.",
        result: false,
      });
    }
  });
});

//création de la route pour récupérer les visites d'un pro
router.get("/:prosId", (req, res) => {

  
  // Vérifier si l'id du professionnel est valide
  if (!mongoose.Types.ObjectId.isValid(req.params.prosId)) {
    return res.json({ message: "L'id du professionnel n'est pas valide." });
  }

  Visite.find({ prosId: req.params.prosId })
    .populate("usersId")
    .populate("bienImmoId")
    .then((data) => {
      if (data) {
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

module.exports = router;
