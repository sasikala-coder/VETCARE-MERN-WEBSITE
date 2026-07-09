const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// @route   GET api/staff
// @desc    Get all staff
// @access  Private (Doctor, Nurse, and Receptionist can view)
router.get('/', [auth], async (req, res) => {
  try {
    // All authenticated users can view staff (read-only for non-doctors)
    const staff = await User.find().select('-password');
    res.json(staff);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/staff
// @desc    Add staff member
// @access  Private (Doctor only)
router.post('/', [auth, roleCheck('doctor')], async (req, res) => {
  try {
    const { name, email, password, role, phone, address } = req.body;
    
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists with this email' });
    }
    
    user = new User({
      name,
      email,
      password,
      role,
      phone,
      address,
    });
    
    await user.save();
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.json(userResponse);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/staff/:id
// @desc    Update staff member
// @access  Private (Doctor only)
router.put('/:id', [auth, roleCheck('doctor')], async (req, res) => {
  try {
    const { name, email, role, phone, address, password } = req.body;
    
    const userFields = {};
    if (name) userFields.name = name;
    if (email) userFields.email = email;
    if (role) userFields.role = role;
    if (phone) userFields.phone = phone;
    if (address) userFields.address = address;
    if (password) {
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      userFields.password = await bcrypt.hash(password, salt);
    }
    
    let user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: userFields },
      { new: true }
    ).select('-password');
    
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/staff/:id
// @desc    Delete staff member
// @access  Private (Doctor only)
router.delete('/:id', [auth, roleCheck('doctor')], async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    if (user.id === req.user.id) {
      return res.status(400).json({ msg: 'You cannot delete your own account' });
    }
    
    await user.deleteOne();
    res.json({ msg: 'Staff member removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;