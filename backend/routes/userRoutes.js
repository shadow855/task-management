const express = require('express');
const { registerUser, authUser, allUsers, updateProfile } = require('../controllers/userControllers');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/register').post(registerUser);
router.route('/login').post(authUser);
router.route('/login/update').put(protect, updateProfile);
router.route('/').get(allUsers);

module.exports = router;