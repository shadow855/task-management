const asyncHandler = require('express-async-handler');
const Task = require('../models/taskModel');

const createTask = asyncHandler(async (req, res) => {
    const { title, description, status, priority } = req.body;

    if (!title) {
        res.status(400);
        throw new Error("Title is required.");
    }

    const taskExist = await Task.findOne({ title, createdBy: req.user._id });

    if (taskExist) {
        res.status(400);
        throw new Error("Task already exists.");
    }

    const task = await Task.create({
        title,
        description,
        status,
        priority,
        createdBy: req.user._id,
    });

    const name = await Task.findById(task._id).
        populate("createdBy", "name");

    if (name) {
        res.status(201).json({
            _id: task._id,
            name: name.createdBy.name,
            title: task.title,
            description: task.description,
            status: task.status,
            priority: task.priority,
        });
    }
    else {
        res.status(400);
        throw new Error("Task not found");
    }
});

const getTasks = asyncHandler(async (req, res) => {
    try {
        const tasks = await Task.find({ createdBy: req.user._id })
            .populate('createdBy', 'name');

        res.status(200).json(tasks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving tasks', error });
    }
});

const updateTask = asyncHandler(async (req, res) => {
    const taskId = req.params.id;
    const { title, description, priority } = req.body;

    try {
        const task = await Task.findOne({ _id: taskId, createdBy: req.user._id });

        if (!task) {
            res.status(404);
            throw new Error('Task not found or does not belong to the user');
        }

        const updatedTask = await Task.findByIdAndUpdate(taskId, {
            title: title || task.title,
            description: description || task.description,
            priority: priority || task.priority
        }, { new: true, runValidators: true })
            .populate('createdBy', 'name');

        res.status(200).json(updatedTask);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating task', error });
    }
});

const taskStatus = asyncHandler(async (req, res) => {
    const taskId = req.params.id;
    const { status } = req.body;

    try {
        const task = await Task.findOne({ _id: taskId, createdBy: req.user._id });

        if (!task) {
            res.status(404);
            throw new Error('Task not found or does not belong to the user');
        }

        const taskStatusUpdated = await Task.findByIdAndUpdate(taskId, {
            status: status || task.status,
        }, { new: true, runValidators: true })
            .populate('createdBy', 'name');

        res.status(200).json(taskStatusUpdated);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating status', error });
    }
});

const getFilteredAndSearchedTasks = asyncHandler(async (req, res) => {
    const { status, title } = req.query;
    const userId = req.user._id;
    let query = { createdBy: userId };

    // If status is provided, filter tasks by status
    if (status) {
        query.status = status;
    }

    // If title is provided, search tasks by title (case-insensitive)
    if (title) {
        query.title = { $regex: title, $options: 'i' };
    }

    try {
        // Find tasks based on the query
        const tasks = await Task.find(query).populate('createdBy', 'name');

        res.status(200).json(tasks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving tasks', error });
    }
});

module.exports = { createTask, updateTask, getTasks, taskStatus, getFilteredAndSearchedTasks }