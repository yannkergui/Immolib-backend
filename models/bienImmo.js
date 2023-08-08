const mongoose = require('mongoose');

const biensSchema = mongoose.Schema({
  titre :String,
  description : String,
  surface: Number,
  type: String,
  transaction: String,
  numeroRue: String,
  rue: String,
  codePostal: Number,
  ville: String,
  nbPièces: Number,
  nbChambres: Number,
  meuble: Boolean,
  photo: String,
  loyerMensuel: Number,
  prixVente: Number,
  visites: [{type: mongoose.Schema.Types.ObjectId, ref: 'visites' }],
  pro: {type: mongoose.Schema.Types.ObjectId, ref: 'pros'},
});
  
const Biens = mongoose.model('biens', biensSchema);

module.exports = Biens;