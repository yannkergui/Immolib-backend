const mongoose = require('mongoose');

const prosSchema = mongoose.Schema({
  raisonSociale: String,
  Siret: Number,
  prenom: String,
  nom: String,
  email : String,
  tel: Number,
  motDePasse: String,
  token: String,
  numRue: String,
  rue: String,
  codePostal : Number,
  photo: String,
  planning : {
    dateDispo:Date,
  },
});
  
const Pros = mongoose.model('pros', prosSchema);

module.exports = Pros;