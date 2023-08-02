var express = require("express");
var router = express.Router();

const moment = require("moment");
const { extendMoment } = require("moment-range");
const extendedMoment = extendMoment(moment);

const Disponibilites = require("../models/disponibilites");
const Visite = require("../models/visites");

// Endpoint pour gérer la création de rendez-vous
router.post('/', async (req, res) => {

  const { prosId, usersId, date, startTime, duration, bienImmoId } = req.body;
  const endTime = moment(startTime, 'HH:mm').add(duration, 'minutes').format('HH:mm');
  const requestedTime = moment(date + ' ' + startTime);

  try {
    // Récupérer toutes les disponibilités du professionnel pour le jour de la semaine spécifié
    const disponibilites = await Disponibilites.find({ prosId: prosId, dayOfWeek: moment(date).format('dddd') });

    // Vérifier les conflits avec les disponibilités existantes
    const hasConflict = disponibilites.some((disponibilite) => {
      const startTime = moment(disponibilite.startTime, 'HH:mm');
      const endTime = moment(disponibilite.endTime, 'HH:mm');
      const availabilityRange = extendedMoment.range(startTime, endTime);
      const requestedRange = extendedMoment.range(requestedTime, requestedTime.clone().add(duration, 'minutes'));

      return availabilityRange.overlaps(requestedRange);
    });

    if (hasConflict) {
      return res.status(409).json({ message: "Conflit de disponibilité. Le créneau n'est pas disponible." });
    }

    // Si pas de conflit, créer le rendez-vous dans la base de données
    const newAppointment = new Visite({
      prosId: prosId,
      usersId: usersId,
      date: date,
      startTime: startTime,
      endTime: endTime,
      duration: duration,
      statut: 'en attente', // Le rendez-vous est en attente de confirmation par le professionnel
      bienImmoId: bienImmoId,
    });

    await newAppointment.save();

    // Mettre à jour la disponibilité du professionnel (voir la logique de mise à jour dans la réponse précédente)

    return res.status(200).json({ message: 'Rendez-vous créé avec succès.' });
  } catch (error) {
    return res.status(500).json({ message: 'Une erreur est survenue lors de la création du rendez-vous.' });
  }
});

module.exports = router;