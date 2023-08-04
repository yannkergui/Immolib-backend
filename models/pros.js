const mongoose = require('mongoose');

const prosSchema = mongoose.Schema({
  prenom: String,
  nom: String,
  email : String,
  tel: String,
  motDePasse: String,
  token: String,
  photo: String,
  agence: {
    denomination: String,
    siren: String,
    siret: String,
    dateCreation: String,
    adresse : String,
    },
  disponibilites : [{type: mongoose.Schema.Types.ObjectId, ref: 'disponibilites'}],
});
  
const Pros = mongoose.model('pros', prosSchema);

module.exports = Pros;