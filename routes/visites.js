var express = require("express");
var router = express.Router();
const mongoose = require("mongoose");

const moment = require("moment");
const { extendMoment } = require("moment-range");
const extendedMoment = extendMoment(moment);

const Disponibilites = require("../models/disponibilites");
const Visite = require("../models/visites");
const Pros = require("../models/pros");

// Création d'une visite et mise à jour des dispo du pro
router.post("/", (req, res) => {
  const { prosId, usersId, dateOfVisit, startTimeVisit, duration, bienImmoId } =
    req.body;




  //création d'une constante pour le endTimeVisit qui est le StartTime + duration de la visite
  const endTimeVisit = moment(startTimeVisit, "HH:mm")
    .add(duration, "minutes")
    .format("HH:mm");
  //création d'une constante pour le jour de la semaine
  const dayOfWeek = moment(dateOfVisit).locale("fr").format("dddd");

  // Vérifier si le pro est disponible
  Disponibilites.findOne({
    pro: prosId,
    dayOfWeek: dayOfWeek,
    startTimeDispo: { $lte: startTimeVisit },
    endTimeDispo: { $gte: endTimeVisit },
  }).then((data) => {
    if (data) {
      if (!data.Exception) {
        data.Exception = [];
      }
      const isConflict = data.Exception.some((exception) => {
        return (
          exception.dateOfVisit === dateOfVisit &&
          //à modifier pour rendre modulable en fonction de la durée de la visite
          exception.startTimeVisit === startTimeVisit &&
          exception.endTimeVisit === endTimeVisit
        );
      });

      if (!isConflict) {
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
      } else {
        res.json({
          message: "Le professionnel est déjà pris sur ces horaires.",
          result: false,
        });
      }
    } else {
      res.json({
        result: false,
        erreur: "pas de disponibilités/planning trouvées",
      });
    }
  });
});

//création de la route pour récupérer les visites d'un pro
router.get("/pro/:token", (req, res) => {
  Pros.findOne({ token: req.params.token }).then((existingPro) => {
    if (!existingPro) {
      return res.json({ result: false, error: "Professionnel non trouvé" });
    }

    Visite.find({ prosId: existingPro._id })
      .populate("usersId")
      .populate("bienImmoId")
      .then((visitesTrouvees) => {
        if (visitesTrouvees.length > 0) {
          // console.log("les visites", visitesTrouvees);
          res.json({ result: true, visitesTrouvees: visitesTrouvees });
        } else {
          res.json({
            result: false,
            error: "Pas de visite trouvée pour ce pro",
          });
        }
      });
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

// Modifier le statut d'une visite à Annulé ou Confirmé :

router.put("/statut/:id", async (req, res) => {
  // Vérifier si l'id de la visite est valide
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.json({ message: "L'id de la visite n'est pas valide." });
  }

  const data = await Visite.findById(req.params.id);

  if (req.body.statut === "confirmé") {
    data.statut = "confirmé";
    await data.save();
    return res.json({
      message: "La visite est confirmée avec succès.",
      result: true,
    });
  } else if (req.body.statut === "annulé") {
    data.statut = "annulé";
    await data.save();

    res.json({
      message: "La visite est annulée avec succès.",
      result: true,
    });

    const dispotrouvee = await Disponibilites.findOne({
      "Exception.dateOfVisit": data.dateOfVisit,
      "Exception.startTimeVisit": data.startTimeVisit,
      "Exception.endTimeVisit": data.endTimeVisit,
      pro: data.prosId, // Utiliser directement data.prosId plutôt que req.body.prosId
    });

    console.log("data: ", dispotrouvee);

    if (dispotrouvee) {
      dispotrouvee.Exception = dispotrouvee.Exception.filter((e) => {
        if (e.dateOfVisit !== data.dateOfVisit) {
          return true; // Garder l'exception si les dates sont différentes
        } else {
          // Si les dates sont les mêmes, vérifier également les heures de début et de fin
          return (
            e.startTimeVisit !== data.startTimeVisit &&
            e.endTimeVisit !== data.endTimeVisit
          );
        }
      });

      // Sauvegarder les modifications apportées aux exceptions
      await dispotrouvee.save();
      console.log("dispotrouvée.Exception: ", dispotrouvee.Exception);
    }
  } else if (req.body.statut === "en attente") {
    data.statut = "en attente";
    await data.save();
    res.json({
      message: "La visite est en attente de confirmation.",
      result: true,
    });
  }
});

//création de la route pour mettre à jour une visite
router.put("/:id", async (req, res) => {
  // Vérifier si l'id de la visite est valide
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.json({ message: "L'id de la visite n'est pas valide." });
  }
  //destructuration du req.body
  const { dateOfVisit, startTimeVisit, duration } = req.body;

  //création d'une constante pour le endTimeVisit qui est le StartTime + duration de la visite
  const endTimeVisit = moment(startTimeVisit, "HH:mm")
    .add(duration, "minutes")
    .format("HH:mm");

  //création d'une constante pour le jour de la semaine
  const dayOfWeek = moment(dateOfVisit).locale("fr").format("dddd");

  Visite.findById(req.params.id).then((data) => {
    //data : c'est le résultat de la visite trouvée via params
    if (data) {
      // Vérifier si le pro est disponible
      Disponibilites.findOne({
        pro: data.prosId,
        dayOfWeek: dayOfWeek,
        startTimeDispo: { $lte: startTimeVisit },
        endTimeDispo: { $gte: endTimeVisit },
      }).then((dispoData) => {
        //dispodata : c'est le résultat de la disponibilité trouvée via params
        if (!dispoData) {
          res.json({
            result: false,
            message: "Le professionnel n'est pas disponible à ces horaires.",
          });
        } else {
          const isConflict = dispoData.Exception.some((exception) => {
            return (
              exception.dateOfVisit === dateOfVisit &&
              exception.startTimeVisit === startTimeVisit &&
              exception.endTimeVisit === endTimeVisit
            );
          });

          if (isConflict) {
            res.json({
              message: "Le professionnel est déjà pris sur ces horaires.",
              result: false,
            });
          } else {
            //suppression de l'exception dans la disponibilité du pro
            dispoData.Exception = dispoData.Exception.filter((e) => {
              if (e.dateOfVisit !== data.dateOfVisit) {
                return true; // Garder l'exception si les dates sont différentes
              } else {
                // Si les dates sont les mêmes, vérifier également les heures de début et de fin
                return (
                  e.startTimeVisit !== data.startTimeVisit &&
                  e.endTimeVisit !== data.endTimeVisit
                );
              }
            });

            // Ajouter l'exception dans la disponibilité du pro
            dispoData.Exception.push({
              dateOfVisit: dateOfVisit,
              startTimeVisit: startTimeVisit,
              endTimeVisit: endTimeVisit,
            });
            dispoData.save();

            //update de la visite
            Visite.updateOne(
              { _id: req.params.id },
              { $set: { ...req.body, endTimeVisit: endTimeVisit } }
            ).then(() => {
              Visite.findById(req.params.id).then((dataNewVisite) => {
                res.json({
                  result: true,
                  message: "La visite a été modifiée avec succès.",
                  data: dataNewVisite,
                });
              });
            });
          }
        }
      });
    } 
  });
});

module.exports = router;
