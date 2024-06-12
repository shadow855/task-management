const express = require('express');
const { registerUser, authUser, updateProfile, loggedUser } = require('../controllers/userControllers');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/register').post(registerUser);
router.route('/login').post(authUser);
router.route('/login/update').put(protect, updateProfile);
router.route('/loggeduserdetails').get(protect, loggedUser);

module.exports = router;