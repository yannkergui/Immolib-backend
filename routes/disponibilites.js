var express = require("express");
var router = express.Router();

const moment = require("moment");
const { extendMoment } = require("moment-range");
const extendedMoment = extendMoment(moment);

require("../models/connection");
const Pros = require("../models/pros");
const Disponibilites = require("../models/disponibilites");
const { checkBody } = require("../modules/checkBody");


// route pour créer une disponibilité
router.post("/", async (req, res) => {
  const { prosId, dayOfWeek, startTime, endTime } = req.body;

  const availabilityRange = extendedMoment.range(
    moment(startTime, "HH:mm"),
    moment(endTime, "HH:mm")
  );

  try {
    // Vérifier s'il existe déjà une disponibilité pour le même jour de la semaine et la même plage horaire
    const existingAvailability = await Disponibilites.findOne({
      prosId: prosId,
      dayOfWeek: dayOfWeek,
      startTime: { $lt: endTime },
      endTime: { $gt: startTime },
    });

    if (existingAvailability) {
      return res
        .json({
          message:
            "Vous avez déjà une disponibilité sur cette plage horaire.",
        });
    }

    // Si pas de conflit, créer la disponibilité dans la base de données
    const newAvailability = new Disponibilites({
      prosId: prosId,
      dayOfWeek: dayOfWeek,
      startTime: startTime,
      endTime: endTime,
    });

    await newAvailability.save();

    return res
      .json({ message: "Disponibilité créée avec succès." });
  } catch (error) {
    return res
      .json({
        message:
          "Une erreur est survenue lors de la création de votre disponibilité.",
      });
  }
});


module.exports = router;
