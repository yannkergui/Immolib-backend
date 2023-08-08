var express = require('express');
var router = express.Router();

require('../models/connection');
const User = require('../models/users');
const { checkBody } = require('../modules/checkBody');
const uid2 = require('uid2');
const bcrypt = require('bcrypt');
const cloudinary = require('cloudinary').v2;
const uniqid = require('uniqid');
const fs = require('fs');

//SIGN UP - INSCRIPTION DE L'UTILISATEUR
router.post('/signup', (req, res) => {
  // Vérifie que les champs ne sont pas vides
  if (!checkBody(req.body, ['prenom', 'nom','email', 'motDePasse', 'tel'])) {
    res.json({ result: false, error: 'champs manquants ou vides' });
    return;
  }
  User.findOne({ email: req.body.email }).then(data => {
    // Vérifie si l'utilisateur n'est pas déjà enregistré dans la BDD
    if (data === null) {
      const hash = bcrypt.hashSync(req.body.motDePasse, 10);

      const {prenom, nom, email, tel, zoneLoc}=req.body

      const newUser = new User({
        prenom, nom, email, tel, zoneLoc,
        motDePasse: hash,
        token: uid2(32),
        })
      newUser.save().then(newDoc => {
        res.json({ result: true, data: newDoc });
      });
    } else {
      // Utilisateur déjà existant dans la BDD
      res.json({ result: false, error: 'Utilisateur déjà existant' });
    }
  });
});


//SIGN IN - CONNEXION DE L'UTILISATEUR
router.post('/signin', (req, res) => {
  // Vérifie que les champs ne sont pas vides
  if (!checkBody(req.body, ['email', 'motDePasse'])) {
    res.json({ result: false, error: 'champs manquants ou vides' });
    return;
  }
  User.findOne({ email: req.body.email }).then(data => {
    // Vérifie si l'utilisateur est bien présent dans la BDD
    if (data && bcrypt.compareSync(req.body.motDePasse, data.motDePasse)) {
      res.json({ result: true, data: data });
    } else {
      res.json({ result: false, error: 'Utilisateur non trouvé ou mauvais mot de passe' });
    }
  });
});

//RECUPERATION D'UN UTILSATEUR DE LA BDD
router.get('/', (req, res) => {
	User.find().then(data => {
		res.json({ data: data });
	});
});

//RECUPERATION D'UN UTILSATEUR DE LA BDD
router.get('/:email', (req, res) => {
  const {email}=req.params;

	User.findOne({email}).then(data => {
    if (data) {
      res.json({ user: data });
    } else {
      res.json({erreur : "Utilisateur non existant"})
    }
		
	});
});

//MISE A JOUR D'UN CHAMP DE LA COLLECTION USERS
router.put('/:email', (req, res) => {  
    
    const data = req.body;

    User.updateOne({email:req.params.email}, {$set : data}).then(() => {
      User.findOne({email:req.params.email}).then(data => { 
      if (data) {
        console.log('data : ', data)
      res.json({userUpdated: data })
      } else {
        res.json({erreur : "Utilisateur non trouvé" })
      }
    })
    })
})


//SUPPRESSION DE COMPTE
router.delete('/:email', (req, res) => {
    User.deleteOne({email: req.params.email})
    .then(() => {
      res.json({message : "compte supprimé" });
    })
 });

 //UPLOAD DES DOCUMENTS UTILISATEUR
 
 router.post('/upload', async (req, res) => {
  const photoPath = `./tmp/${uniqid()}.jpg`;
  const resultMove = await req.files.photoFromFront.mv(photoPath);

  if (!resultMove) {
    const resultCloudinary = await cloudinary.uploader.upload(photoPath);
    res.json({ result: true, url: resultCloudinary.secure_url });
  } else {
    res.json({ result: false, error: resultMove });
  }

  fs.unlinkSync(photoPath);
});

module.exports = router;
