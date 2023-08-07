var express = require("express");
var router = express.Router();

const moment = require("moment");
const { extendMoment } = require("moment-range");
const extendedMoment = extendMoment(moment);

require("../models/connection");
const Pros = require("../models/pros");
const Disponibilites = require("../models/disponibilites");
const { checkBody } = require("../modules/checkBody");

// route pour créer/ajouter une disponibilité
router.post("/", async (req, res) => {
  const { pro, dayOfWeek, startTimeDispo, endTimeDispo } = req.body;

  const availabilityRange = extendedMoment.range(
    moment(startTimeDispo, "HH:mm"),
    moment(endTimeDispo, "HH:mm")
  );

  try {
    // Vérifier s'il existe déjà une disponibilité pour le même jour de la semaine et la même plage horaire
    const existingAvailability = await Disponibilites.findOne({
      pro: pro,
      dayOfWeek: dayOfWeek,
      startTimeDispo: { $lt: endTimeDispo },
      endTimeDispo: { $gt: startTimeDispo },
    });

    if (existingAvailability) {
      return res.json({
        message: "Vous avez déjà une disponibilité sur cette plage horaire.",
      });
    }

    // Si pas de conflit, créer la disponibilité dans la base de données
    const newAvailability = new Disponibilites({
      pro: pro,
      dayOfWeek: dayOfWeek,
      startTimeDispo: startTimeDispo,
      endTimeDispo: endTimeDispo,
      Exception: [],
    });

    await newAvailability.save();

    return res.json({ message: "Disponibilité créée avec succès." });
  } catch (error) {
    return res.json({
      message:
        "Une erreur est survenue lors de la création de votre disponibilité.",
    });
  }
});

// route pour récupérer les disponibilités d'un pro
router.get("/:pro", (req, res) => {
  Disponibilites.find().then((data) => {
    let result = [];

    for (let i = 0; i < data.length; i++) {
      if (data[i].pro == req.params.pro) {
        console.log(data[i]);
        result.push(data[i]);
      }
    }
    if (result.length == 0) {
      res.json({ result: false });
    } else {
      res.json({ data: result });
    }
  });
});

router.post("/dateSearch/:pro", (req, res) => {
  
  //création d'une constante pour la date de la visite
  const{dateOfVisit} = req.body;

  //création d'une constante pour le jour de la semaine
  const dayOfWeek = moment(dateOfVisit).locale("fr").format("dddd");

  // Vérifier si le pro est disponible un jour en particulier
  Disponibilites.find({
    pro: req.params.pro,
    dayOfWeek: dayOfWeek,
  }).then((data) => {
    console.log('data',data);
    let result = [];

    for (let i = 0; i < data.length; i++) {
      if (data[i].pro == req.params.pro) {
        // console.log(data[i]);
        result.push(data[i]);
      }
    }
    if (result.length == 0) {
      res.json({ result: false });
    } else {
      res.json({result: true, data: result });
    }
  });
});


// route pour supprimer une disponibilité
router.delete("/:id", (req, res) => {
  Disponibilites.findById(req.params.id).then((data) => {
    if (data) {
      Disponibilites.findByIdAndDelete(req.params.id).then(() => {
        res.json({ message: "Disponibilité supprimée avec succès." });
      });
    } else {
      res.json({ message: "Disponibilité introuvable" });
    }
  });
});

// route pour modifier une disponibilité
router.put("/:id", (req, res) => {
  const data = req.body;

  Disponibilites.updateOne({ _id: req.params.id }, { $set: data }).then(() => {
    Disponibilites.findById(req.params.id).then((data) => {
      if (data) {
        res.json({
          dispo: data,
          // result : ''
        });
      } else {
        res.json({ erreur: "Disponibilité non trouvée" });
      }
    });
  });
});

module.exports = router;
