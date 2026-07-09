const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const PetRecord = require('../models/PetRecord');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// @route   GET api/petrecords
// @desc    Get all pet records
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const petRecords = await PetRecord.find().sort({ createdAt: -1 });
    res.json(petRecords);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/petrecords/:id
// @desc    Get pet record by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const petRecord = await PetRecord.findById(req.params.id);
    if (!petRecord) {
      return res.status(404).json({ msg: 'Pet record not found' });
    }
    res.json(petRecord);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Pet record not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST api/petrecords
// @desc    Create a pet record
// @access  Private (Doctor, Nurse, Receptionist)
router.post('/', [auth, roleCheck('doctor', 'nurse', 'receptionist'), [
  check('petName', 'Pet name is required').not().isEmpty(),
  check('species', 'Species is required').not().isEmpty(),
  check('ownerName', 'Owner name is required').not().isEmpty(),
]], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const newPetRecord = new PetRecord(req.body);
    const petRecord = await newPetRecord.save();
    res.json(petRecord);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/petrecords/:id
// @desc    Update a pet record
// @access  Private (Doctor, Nurse)
router.put('/:id', [auth, roleCheck('doctor', 'nurse')], async (req, res) => {
  try {
    let petRecord = await PetRecord.findById(req.params.id);
    if (!petRecord) {
      return res.status(404).json({ msg: 'Pet record not found' });
    }
    
    petRecord = await PetRecord.findByIdAndUpdate(
      req.params.id,
      { $set: req.body, updatedAt: Date.now() },
      { new: true }
    );
    
    res.json(petRecord);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/petrecords/:id
// @desc    Delete a pet record
// @access  Private (Doctor only)
router.delete('/:id', [auth, roleCheck('doctor')], async (req, res) => {
  try {
    const petRecord = await PetRecord.findById(req.params.id);
    if (!petRecord) {
      return res.status(404).json({ msg: 'Pet record not found' });
    }
    
    await petRecord.remove();
    res.json({ msg: 'Pet record removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;