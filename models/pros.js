const mongoose = require('mongoose');

const prosSchema = mongoose.Schema({
  raisonSociale: String,
  siret: Number,
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
  disponibilites : [{type: mongoose.Schema.Types.ObjectId, ref: 'disponibilites'}],
});
  
const Pros = mongoose.model('pros', prosSchema);

module.exports = Pros;