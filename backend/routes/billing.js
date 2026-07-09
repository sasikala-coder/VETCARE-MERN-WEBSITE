const express = require('express');
const router = express.Router();
const Billing = require('../models/Billing');
const auth = require('../middleware/auth');

// Get all bills
router.get('/', auth, async (req, res) => {
  try {
    const bills = await Billing.find()
      .populate('petId', 'petName ownerName')
      .sort({ createdAt: -1 });
    res.json(bills);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Create bill
router.post('/', auth, async (req, res) => {
  try {
    const newBill = new Billing(req.body);
    const bill = await newBill.save();
    res.json(bill);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// PROCESS PAYMENT - THIS IS THE IMPORTANT PART
router.put('/:id/pay', auth, async (req, res) => {
  try {
    const { paymentMethod } = req.body;
    const bill = await Billing.findById(req.params.id);
    
    if (!bill) {
      return res.status(404).json({ msg: 'Bill not found' });
    }
    
    bill.status = 'paid';
    bill.paymentMethod = paymentMethod;
    bill.paymentDate = Date.now();
    
    await bill.save();
    res.json({ success: true, message: 'Payment successful', bill });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;