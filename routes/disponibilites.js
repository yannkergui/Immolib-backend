var express = require("express");
var router = express.Router();

require("../models/connection");
const Pros = require("../models/pros");
const Disponibilites = require("../models/disponibilites");
const { checkBody } = require("../modules/checkBody");

//route pour créer une disponibilité
router.post("/", (req, res) => {
  // Vérifie que les champs ne sont pas vides
  if (!checkBody(req.body, ["dayOfWeek", "startTime", "endTime", "pro"])) {
    res.json({ result: false, error: "champs manquants ou vides" });
    return;
  }
  const { dayOfWeek, startTime, endTime, pro} = req.body
      const newDisponibilite = new Disponibilites({
        dayOfWeek,
        startTime,
        endTime,
        pro,
      });
      newDisponibilite.save()
      // .populate('pros')
      .then((newDoc) => {
        res.json({ result: true, data: newDoc });
      });
  });




module.exports = router;
