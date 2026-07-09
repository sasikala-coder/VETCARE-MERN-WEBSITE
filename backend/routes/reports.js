const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const Billing = require('../models/Billing');
const PetRecord = require('../models/PetRecord');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// @route   GET api/reports/appointments
// @desc    Get appointment reports
// @access  Private (Doctor, Admin)
router.get('/appointments', [auth, roleCheck('doctor')], async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = {};
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }
    
    const appointments = await Appointment.find(query)
      .populate('petId', 'petName ownerName')
      .populate('doctorId', 'name');
    
    const stats = {
      total: appointments.length,
      scheduled: appointments.filter(a => a.status === 'scheduled').length,
      completed: appointments.filter(a => a.status === 'completed').length,
      cancelled: appointments.filter(a => a.status === 'cancelled').length,
      noShow: appointments.filter(a => a.status === 'no-show').length,
    };
    
    res.json({ appointments, stats });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/reports/revenue
// @desc    Get revenue reports
// @access  Private (Doctor, Admin)
router.get('/revenue', [auth, roleCheck('doctor')], async (req, res) => {
  try {
    const { period } = req.query; // daily, weekly, monthly, yearly
    
    const paidBills = await Billing.find({ status: 'paid' });
    const totalRevenue = paidBills.reduce((sum, bill) => sum + bill.total, 0);
    
    res.json({
      totalRevenue,
      totalBills: paidBills.length,
      averageBillValue: totalRevenue / paidBills.length || 0,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/reports/pets
// @desc    Get pet statistics
// @access  Private
router.get('/pets', auth, async (req, res) => {
  try {
    const pets = await PetRecord.find();
    const speciesCount = {};
    pets.forEach(pet => {
      speciesCount[pet.species] = (speciesCount[pet.species] || 0) + 1;
    });
    
    res.json({
      totalPets: pets.length,
      speciesDistribution: speciesCount,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;