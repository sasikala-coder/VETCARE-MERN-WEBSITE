const mongoose = require('mongoose');

const PetRecordSchema = new mongoose.Schema({
  petName: {
    type: String,
    required: true,
  },
  species: {
    type: String,
    required: true,
  },
  breed: String,
  age: Number,
  weight: Number,
  ownerName: {
    type: String,
    required: true,
  },
  ownerPhone: String,
  ownerEmail: String,
  medicalHistory: String,
  allergies: String,
  vaccinations: [{
    name: String,
    date: Date,
    nextDue: Date,
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('PetRecord', PetRecordSchema);