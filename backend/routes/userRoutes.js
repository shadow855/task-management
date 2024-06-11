const express = require('express');
const { registerUser, authUser, allUsers } = require('../controllers/userControllers');

const router = express.Router();

router.route('/register').post(registerUser);
router.route('/login').post(authUser);
router.route('/').get(allUsers);

module.exports = router;