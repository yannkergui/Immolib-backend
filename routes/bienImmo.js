var express = require('express');
var router = express.Router();

require('../models/connection');
const Pros = require('../models/pros');
const Visite = require('../models/visites');
const Biens = require('../models/bienImmo')
const { checkBody } = require('../modules/checkBody');

// création Du bien
router.post('/newBien', (req, res) => {
  // Vérifie que les champs ne sont pas vides
  if (!checkBody(req.body, ['titre','description', 'surface','transaction', 'type', 'numeroRue','codePostal'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }
  Biens.findOne({ email: req.body.titre }).then(data => {
    // Vérifie si le bien n'est pas déjà enregistré dans la BDD
    if (data === null) {
      const {titre, description, surface, type, transaction, numéroRue, rue, codePostal, nbPièces, nbChambres, meuble, photo, pro, loyerMensuel, prixVente}=req.body

      const newBien = new Biens({
        titre, description, surface, type, transaction, numéroRue, rue, codePostal, nbPièces, nbChambres, meuble, photo, pro,loyerMensuel, prixVente
        })
     

      newBien.save().then(newDoc => {
        res.json({ result: true, bien: newDoc });
      });
    } else {
      // Bien déjà existant dans la BDD
      res.json({ result: false, error: 'User already exists' });
    }
  });
});

//recherche d'un Bien
router.get("/:Id", (req, res) => {
    Biens.findById(
      req.params.Id,
    ).then(data => {
      if (data) {
        res.json({ result: true, data: data });
      } else {
        res.json({ result: false, error: "user not found" });
      }
    });
  });


//MISE A JOUR D'UN CHAMP DE LA COLLECTION Bien
router.put('/:Id', (req, res) => {  
    
    const data = req.body;

    Biens.updateOne({_id:req.params.Id}, {$set : data}).then(() => {
      Biens.findById(req.params.Id).then(data => { 
      if (data) {
        console.log('data : ', data)
      res.json({userUpdated: data })
      } else {
        res.json({erreur : "Bien non trouvé" })
      }
    })
    })
})


//SUPPRESSION DE Bien
router.delete('/:Id', (req, res) => {
    Biens.deleteOne({_id: req.params.Id})
    .then(() => {
      res.json({message : "Bien supprimé" });
    })
 });
 


module.exports = router;
