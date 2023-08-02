var express = require("express");
var router = express.Router();

require("../models/connection");
const Pros = require("../models/pros");
const Disponibilites = require("../models/disponibilites");
const { checkBody } = require("../modules/checkBody");

//route pour créer une disponibilité
router.post("/:id", async (req, res) => {
  // Vérifie que les champs ne sont pas vides
  if (!checkBody(req.body, ["dayOfWeek", "startTime", "endTime", "pro"])) {
    res.json({ result: false, error: "champs manquants ou vides" });
    return;
  }
  Disponibilites.findById(req.params.id).then((data) => {
    // Vérifie si l'utilisateur n'est pas déjà enregistré dans la BDD
    if (data === null) {
      const { dayOfWeek, startTime, endTime, pro } = req.body;

      const newDisponibilite = new Disponibilites({
        dayOfWeek,
        startTime,
        endTime,
        pro,
      });
      newDisponibilite.save().populate('pros')
      .then((newDoc) => {
        res.json({ result: true, data: newDoc });
      });
    } else {
      // Disponibilité déjà existante dans la BDD
      res.json({ result: false, error: "Disponibilité déjà existante" });
    }
  });
});



module.exports = router;
