const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  prenom: String,
  nom: String,
  email : String,
  tel: Number,
  motDePasse: String,
  token: String,
  location : {
    zoneLoc : String,
    budgetMois: Number,
    typeBienLoc: String,
    minSurfaceLoc: Number,
    minPieceLoc: Number,
    nbLoc: Number,
    meuble: String,
  },
  achat : {
    zoneAchat: String,
    budgetMax : Number,
    typeBienAchat: String,
    minSurfaceAchat: Number,
    minPieceAchat: Number,
    typeInvest : String,
  },
  salaire : String,
  primo: Boolean,
  financement: String,
  accordBanque: Boolean,
  banqueDoc: String,
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
  }
});

const User = mongoose.model('users', userSchema);

module.exports = User;