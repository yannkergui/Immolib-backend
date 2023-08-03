var express = require("express");
var router = express.Router();

require("../models/connection");
const Pros = require("../models/pros");
const { checkBody } = require("../modules/checkBody");
const uid2 = require("uid2");
const bcrypt = require("bcrypt");

//SIGN UP - inscription Du Pro
router.post("/signup", (req, res) => {
  // Vérifie que les champs ne sont pas vides
  if (
    !checkBody(req.body, [
      "raisonSociale",
      "prenom",
      "nom",
      "email",
      "motDePasse",
      "tel",
    ])
  ) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }
  Pros.findOne({ email: req.body.email }).then((data) => {
    // Vérifie si l'utilisateur n'est pas déjà enregistré dans la BDD
    if (data === null) {
      const hash = bcrypt.hashSync(req.body.motDePasse, 10);

      const { raisonSociale, siret, prenom, nom, email, tel } = req.body;

      const newPros = new Pros({
        raisonSociale,
        siret,
        prenom,
        nom,
        email,
        tel,
        motDePasse: hash,
        token: uid2(32),
      });

      newPros.save().then((newDoc) => {
        res.json({ result: true, pro: newDoc });
      });
    } else {
      // Utilisateur déjà existant dans la BDD
      res.json({ result: false, error: "User already exists" });
    }
  });
});

//SIGN IN - CONNEXION DU Pro
router.post("/signin", (req, res) => {
  // Vérifie que les champs ne sont pas vides
  if (!checkBody(req.body, ["email", "motDePasse"])) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }
  Pros.findOne({ email: req.body.email }).then((data) => {
    // Vérifie si l'utilisateur est bien présent dans la BDD
    if (data && bcrypt.compareSync(req.body.motDePasse, data.motDePasse)) {
      res.json({ result: true, pro: data });
    } else {
      res.json({ result: false, error: "User not found or wrong password" });
    }
  });
});

//recherche d'un Pro
router.get("/:email", (req, res) => {
  Pros.findOne({
    email: req.params.email,
  }).then((data) => {
    if (data) {
      res.json({ result: true, pro: data });
    } else {
      res.json({ result: false, error: "user not found" });
    }
  });
});

//MISE A JOUR D'UN CHAMP DE LA COLLECTION PROS
router.put('/:token', (req, res) => {  
    
  const data = req.body;

  Pros.updateOne({token:req.params.token}, {$set : data}).then(() => {
    Pros.findOne({token:req.params.token}).then(proUpdated => { 
    if (proUpdated) {
      console.log('data : ', proUpdated)
    res.json({proUpdated: proUpdated })
    } else {
      res.json({erreur : "Utilisateur non trouvé" })
    }
  })
  })
})


//SUPPRESSION DE COMPTE
router.delete("/:email", (req, res) => {
  Pros.deleteOne({ email: req.params.email }).then(() => {
    res.json({ message: "compte supprimé" });
  });
});

//route pour supprimer des disponibilités d'un pro :






module.exports = router;
