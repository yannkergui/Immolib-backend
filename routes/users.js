var express = require('express');
var router = express.Router();

require('../models/connection');
const User = require('../models/users');
const { checkBody } = require('../modules/checkBody');
const uid2 = require('uid2');
const bcrypt = require('bcrypt');

//SIGN UP - INSCRIPTION DE L'UTILISATEUR
router.post('/signup', (req, res) => {
  // Vérifie que les champs ne sont pas vides
  if (!checkBody(req.body, ['prenom', 'nom','email', 'motDePasse', 'tel'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }
  User.findOne({ email: req.body.email }).then(data => {
    // Vérifie si l'utilisateur n'est pas déjà enregistré dans la BDD
    if (data === null) {
      const hash = bcrypt.hashSync(req.body.motDePasse, 10);

      const {prenom, nom, email, tel}=req.body

      const newUser = new User({
        prenom, nom, email, tel,
        motDePasse: hash,
        token: uid2(32),
        })
      /*
      const newUser = new User({
        prenom: req.body.prenom,
        nom: req.body.nom,
        email: req.body.email,
        tel: req.body.tel,
        motDePasse: hash,
        token: uid2(32),
        location : {
          zone : req.body.zone,
          budgetMois: req.body.budgetMois,
          typeBien: req.body.typeBien,
          minSurface: req.body.minSurface,
          minPiece: req.body.minPiece,
          nbLoc: req.body.nbLoc,
          meuble: req.body.meuble,
        },
        achat : {
          zone: req.body.zone,
          budgetMax : req.body.budgetMax,
          typeBien: req.body.typeBien,
          minSurface: req.body.minSurface,
          minPiece: req.body.minPiece,
          typeInvest : req.body.typeInvest,
        },
        salaire : req.body.salaire,
        primo: req.body.primo,
        financement: req.body.financement,
        accordBanque: req.body.accordBanque,
        banqueDoc: req.body.banqueDoc,
        documents : {
          idDoc: req.body.idDoc,
          domDoc: req.body.domDoc,
          contrat : req.body.contrat,
          salaire1: req.body.salaire1,
          salaire2: req.body.salaire2,
          salaire3: req.body.salaire3,
          impots: req.body.impots,
          bilan: req.body.bilan,
          autres : req.body.autres,
        }
        
      }); */

      newUser.save().then(newDoc => {
        res.json({ result: true, token: newDoc.token });
      });
    } else {
      // Utilisateur déjà existant dans la BDD
      res.json({ result: false, error: 'User already exists' });
    }
  });
});


//SIGN IN - CONNEXION DE L'UTILISATEUR
router.post('/signin', (req, res) => {
  // Vérifie que les champs ne sont pas vides
  if (!checkBody(req.body, ['email', 'motDePasse'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }
  User.findOne({ email: req.body.email }).then(data => {
    // Vérifie si l'utilisateur est bien présent dans la BDD
    if (data && bcrypt.compareSync(req.body.motDePasse, data.motDePasse)) {
      res.json({ result: true, token: data.token });
    } else {
      res.json({ result: false, error: 'User not found or wrong password' });
    }
  });
});


//MISE A JOUR D'UN CHAMP DE LA COLLECTION USERS
router.put('/', (req, res) => {  
  const {prenom, nom, email, tel, 
    zone, budgetMois, typeBien, minSurface, minPiece, nbLoc, meuble, 
    budgetMax, typeInvest, 
    salaire, primo, financement, accordBanque, banqueDoc,
    idDoc, domDoc, contrat, salaire1, salaire2, salaire3, impots, bilan, autres}=req.body

    User.findOne({ email }).then(data => { 
      data.prenom=prenom;
      data.nom=nom;
      data.tel=tel;

      data.location.zone=zone;
      data.location.budgetMois=budgetMois;
      data.location.typeBien=typeBien;
      data.location.minSurface=minSurface;
      data.location.minPiece=minPiece;
      data.location.nbLoc=nbLoc;
      data.location.meuble=meuble;

      data.achat.zone = zone;
      data.achat.budgetMax = budgetMax;
      data.achat.typeBien=typeBien;
      data.achat.minSurface=minSurface;
      data.achat.minPiece=minPiece;
      data.achat.typeInvest=typeInvest;

      data.salaire=salaire;
      data.primo=primo;
      data.financement=financement;
      data.accordBanque=accordBanque;
      data.banqueDoc=banqueDoc;

      data.documents.idDoc=idDoc;
      data.documents.domDoc=domDoc;
      data.documents.contrat=contrat;
      data.documents.salaire1=salaire1;
      data.documents.salaire2=salaire2;
      data.documents.salaire3=salaire3;
      data.documents.impots=impots;
      data.documents.bilan=bilan;
      data.documents.autres=autres;

      res.json({"user après modif": data })
    });
})


//SUPPRESSION DE COMPTE
router.delete('/:email', (req, res) => {
    User.deleteOne({email: req.params.email})
    .then(() => {
      res.json({message : "compte supprimé" });
    })
 });
 


module.exports = router;
