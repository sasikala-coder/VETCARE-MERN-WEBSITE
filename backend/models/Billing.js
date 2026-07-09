const mongoose = require('mongoose');

const BillingSchema = new mongoose.Schema({
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
  },
  petId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PetRecord',
    required: true,
  },
  items: [{
    description: String,
    quantity: Number,
    unitPrice: Number,
    total: Number,
  }],
  subtotal: {
    type: Number,
    required: true,
  },
  tax: {
    type: Number,
    default: 0,
  },
  total: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'cancelled'],
    default: 'pending',
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'insurance'],
  },
  paymentDate: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Billing', BillingSchema);