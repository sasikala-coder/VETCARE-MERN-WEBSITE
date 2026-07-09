const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const Appointment = require('../models/Appointment');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// @route   GET api/appointments
// @desc    Get all appointments
// @access  Private (All roles)
router.get('/', auth, async (req, res) => {
  try {
    let appointments;
    if (req.user.role === 'doctor') {
      appointments = await Appointment.find()
        .populate('petId', 'petName ownerName')
        .populate('doctorId', 'name')
        .populate('createdBy', 'name')
        .sort({ date: 1, time: 1 });
    } else if (req.user.role === 'nurse') {
      appointments = await Appointment.find()
        .populate('petId', 'petName ownerName')
        .populate('doctorId', 'name')
        .sort({ date: 1, time: 1 });
    } else {
      appointments = await Appointment.find()
        .populate('petId', 'petName ownerName')
        .populate('doctorId', 'name')
        .sort({ date: 1, time: 1 });
    }
    res.json(appointments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/appointments
// @desc    Create an appointment
// @access  Private (Doctor, Receptionist, Nurse)
router.post('/', [auth, roleCheck('doctor', 'nurse', 'receptionist'), [
  check('petId', 'Pet ID is required').not().isEmpty(),
  check('doctorId', 'Doctor ID is required').not().isEmpty(),
  check('date', 'Date is required').not().isEmpty(),
  check('time', 'Time is required').not().isEmpty(),
]], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const newAppointment = new Appointment({
      ...req.body,
      createdBy: req.user.id,
    });
    const appointment = await newAppointment.save();
    res.json(appointment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/appointments/:id
// @desc    Update appointment status
// @access  Private (Doctor and Receptionist only)
router.put('/:id', [auth, roleCheck('doctor', 'receptionist')], async (req, res) => {
  try {
    let appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ msg: 'Appointment not found' });
    }
    
    appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    
    res.json(appointment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/appointments/:id
// @desc    Delete appointment
// @access  Private (Doctor only)
router.delete('/:id', [auth, roleCheck('doctor')], async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ msg: 'Appointment not found' });
    }
    
    await appointment.deleteOne();
    res.json({ msg: 'Appointment removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;