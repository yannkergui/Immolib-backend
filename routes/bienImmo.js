var express = require("express");
var router = express.Router();

require("../models/connection");
const Pros = require("../models/pros");
const Visite = require("../models/visites");
const Biens = require("../models/bienImmo");
const Disponibilites = require("../models/disponibilites");
const { checkBody } = require("../modules/checkBody");
const cloudinary = require("cloudinary").v2;
const uniqid = require("uniqid");
const fs = require("fs");

// création Du bien
router.post("/newBien", (req, res) => {
  // Vérifie que les champs ne sont pas vides
  if (
    !checkBody(req.body, [
      "titre",
      "description",
      "surface",
      "transaction",
      "type",
      "numeroRue",
      "rue",
      "codePostal",
    ])
  ) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }
  Biens.findOne({ titre: req.body.titre }).then((data) => {
    // Vérifie si le bien n'est pas déjà enregistré dans la BDD
    if (data === null) {
      const {
        titre,
        description,
        surface,
        type,
        transaction,
        numeroRue,
        rue,
        codePostal,
        nbPièces,
        nbChambres,
        meuble,
        photo,
        pro,
        loyerMensuel,
        prixVente,
        ville,
      } = req.body;

      const newBien = new Biens({
        titre,
        description,
        surface,
        type,
        transaction,
        numeroRue,
        rue,
        codePostal,
        nbPièces,
        nbChambres,
        meuble,
        photo,
        pro,
        loyerMensuel,
        prixVente,
        ville,
      });

      newBien.save().then((newDoc) => {
        res.json({ result: true, bien: newDoc });
      });
    } else {
      // Bien déjà existant dans la BDD
      res.json({ result: false, error: "User already exists" });
    }
  });
});

//recherche d'un Bien
router.get("/:Id", (req, res) => {
  Biens.findById(req.params.Id).then((data) => {
    if (data) {
      res.json({ result: true, data: data });
    } else {
      res.json({ result: false, error: "user not found" });
    }
  });
});

//recherche d'un Bien via l'idpro

router.get("/pro/:pro", (req, res) => {
  Biens.find({ pro: req.params.pro }).then((data) => {
    if (data) {
      res.json({ result: true, biens: data });
    } else {
      res.json({ result: false, error: "user not found" });
    }
  });
});

//MISE A JOUR D'UN CHAMP DE LA COLLECTION Bien
router.put("/:Id", (req, res) => {
  const data = req.body;

  Biens.updateOne({ _id: req.params.Id }, { $set: data }).then(() => {
    Biens.findById(req.params.Id).then((data) => {
      if (data) {
        console.log("data : ", data);
        res.json({ userUpdated: data });
      } else {
        res.json({ erreur: "Bien non trouvé" });
      }
    });
  });
});

//SUPPRESSION DE Bien

// router.delete('/:Id', (req, res) => {
//     Biens.deleteOne({Id: req.params.Id})
//     .then(() => {
//       res.json({message : "Bien supprimé" });
//     })
//  });

router.delete("/:Id", async (req, res) => {
  const bienId = req.params.Id;

  const visites = await Visite.find({ bienImmoId: bienId }).populate(
    "bienImmoId"
  );
  console.log("visites", visites);

  if (visites.length === 1) {
    await Visite.deleteOne({ bienImmoId: bienId });
  } else if (visites.length > 1) {
    await Visite.deleteMany({ bienImmoId: bienId });
  } else {
    res.json({ message: "Pas de visite associée" });
  }

  await Biens.deleteOne({ _id: bienId });

  res.json({ message: "Bien et visites associées supprimés avec succès." });

});


//UPLOAD DES PHOTOS DU BIEN

router.post("/upload", async (req, res) => {
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
