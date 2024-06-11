const asyncHandler = require("express-async-handler");
const User = require('../models/userModel');
const generateToken = require("../config/generateToken");
const bcrypt = require('bcryptjs');

const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        res.status(400);
        throw new Error("Please enter all the fields.");
    }

    const userExist = await User.findOne({ email });

    if (userExist) {
        res.status(400);
        throw new Error("User already exists.");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
        name, email, password: hashedPassword
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id),
        });
    }
    else {
        res.status(400);
        throw new Error("User not found");
    }
});

const authUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400);
        throw new Error("Please enter all the fields.");
    }

    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id),
        });
    }
    else {
        res.status(400);
        throw new Error("Invalid email or password");
    }
});

const allUsers = asyncHandler(async (req, res) => {
    const users = await User.find();

    res.status(201).send(users);
})

module.exports = { registerUser, authUser, allUsers };