var express = require('express');
var router = express.Router();

require('../models/connection');
const Pros = require('../models/pros');
const { checkBody } = require('../modules/checkBody');
const uid2 = require('uid2');
const bcrypt = require('bcrypt');

//SIGN UP - inscription Du Pro
router.post('/signup', (req, res) => {
  // Vérifie que les champs ne sont pas vides
  if (!checkBody(req.body, ['raisonSociale','prenom', 'nom','email', 'motDePasse', 'tel'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }
  Pros.findOne({ email: req.body.email }).then(data => {
    // Vérifie si l'utilisateur n'est pas déjà enregistré dans la BDD
    if (data === null) {
      const hash = bcrypt.hashSync(req.body.motDePasse, 10);

      const {raisonSociale, Siret, prenom, nom, email, tel}=req.body

      const newPros = new Pros({
        raisonSociale, Siret, prenom, nom, email, tel,
        motDePasse: hash,
        token: uid2(32),
        })
     

      newPros.save().then(newDoc => {
        res.json({ result: true, token: newDoc.token });
      });
    } else {
      // Utilisateur déjà existant dans la BDD
      res.json({ result: false, error: 'User already exists' });
    }
  });
});


//SIGN IN - CONNEXION DU Pro
router.post('/signin', (req, res) => {
  // Vérifie que les champs ne sont pas vides
  if (!checkBody(req.body, ['email', 'motDePasse'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }
  Pros.findOne({ email: req.body.email }).then(data => {
    // Vérifie si l'utilisateur est bien présent dans la BDD
    if (data && bcrypt.compareSync(req.body.motDePasse, data.motDePasse)) {
      res.json({ result: true, token: data.token });
    } else {
      res.json({ result: false, error: 'User not found or wrong password' });
    }
  });
});


//MISE A JOUR D'UN CHAMP DE LA COLLECTION Pros
router.put('/', (req, res) => {  
  const {raisonSociale, Siret, prenom, nom, email, tel, motDePasse, numRue, codePostal, photo}=req.body

    Pros.updateOne({ email }).then(data => { 
      data.raisonSociale=raisonSociale;
      data.Siret=Siret;
      data.prenom=prenom;
      data.nom=nom;
      data.tel=tel;

      data.motDePasse=motDePasse;
      data.numRue=numRue;
      data.codePostal=codePostal;
      data.photo=photo;

      res.json({"user après modif": data })
    });
})


//SUPPRESSION DE COMPTE
router.delete('/:email', (req, res) => {
    Pros.deleteOne({email: req.params.email})
    .then(() => {
      res.json({message : "compte supprimé" });
    })
 });
 


module.exports = router;
