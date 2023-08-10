const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  prenom: String,
  nom: String,
  email : String,
  tel: String,
  motDePasse: String,
  token: String,
  zone: String,
  location : {
    budgetMois: Number,
    typeBienLoc: String,
    minSurfaceLoc: Number,
    minPieceLoc: Number,
    nbLoc: Number,
    meuble: String,
  },
  achat : {
    budgetMax : Number,
    typeBienAchat: String,
    minSurfaceAchat: Number,
    minPieceAchat: Number,
    typeInvest : String,
    primo: String,
    financement: String,
    accordBanque: Boolean,
  },
  recherche: String,
  situation :String,
  salaire : String,
  contrat : String,
  documents : {
    idDoc: String,
    domDoc: String,
    contrat : String,
    salaire1: String,
    salaire2: String,
    salaire3: String,
    impots: String,
    bilan: String,
    autres : String,
    banqueDoc: String,
  }
});

const User = mongoose.model('users', userSchema);

module.exports = User;