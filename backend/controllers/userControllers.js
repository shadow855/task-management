//controller for handling users

const asyncHandler = require("express-async-handler");
const User = require('../models/userModel');
const generateToken = require("../config/generateToken");
const bcrypt = require('bcryptjs');

//register the user
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

//log in the registered user only
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

//get details-name/email of logged in user only
const loggedUser = asyncHandler(async (req, res) => {
    const user = await User.findOne(req.user._id).select('-password');
    res.status(201).send(user);
});

//update name/password of logged in user only
const updateProfile = asyncHandler(async (req, res) => {
    const { name, password } = req.body;

    try {
        const user = await User.findOne(req.user._id);

        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }

        //updating name/password if provided and if not then just keep the same credentials
        const updateFields = {};
        if (name) updateFields.name = name;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            updateFields.password = await bcrypt.hash(password, salt);
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            { $set: updateFields },
            { new: true, runValidators: true }
        );

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating user', error });
    }
});

module.exports = { registerUser, authUser, loggedUser, updateProfile };