//controller for handling tasks

const asyncHandler = require('express-async-handler');
const Task = require('../models/taskModel');
const User = require('../models/userModel');

//add task for authentic user
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

//update the task title/description/priority for authentic user
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

//set task status to pending/completed for authentic user
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

// get tasks based on filter/search/sortbydate/sortby priority for authentic user
const getFilteredAndSearchedTasks = asyncHandler(async (req, res) => {
    const { status, title, sortField, sortOrder, priorityOrder } = req.query;
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

    // Determine sort options
    let sortOptions = {};
    if (sortField) {
        sortOptions[sortField] = sortOrder === 'desc' ? -1 : 1;
    }


    try {
        const user = await User.findById(req.user._id).select('name');
        // Find tasks based on the query
        const tasks = await Task.find(query).sort(sortOptions);

        // Sort tasks by priority
        if (priorityOrder) {
            tasks.sort((a, b) => {
                const priorityValues = ['low', 'medium', 'high'];
                const priorityA = priorityValues.indexOf(a.priority);
                const priorityB = priorityValues.indexOf(b.priority);
                return priorityOrder === 'asc' ? priorityA - priorityB : priorityB - priorityA;
            });
        }

        res.status(200).json({
            user: user.name,
            tasks: tasks
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving tasks', error });
    }
});

//delete the task for authentic user
const deleteTask = asyncHandler(async (req, res) => {
    const taskId = req.params.id;

    try {
        const task = await Task.findOne({ _id: taskId, createdBy: req.user._id });

        if (!task) {
            res.status(404);
            throw new Error('Task not found or does not belong to the user');
        }

        await Task.findByIdAndDelete(taskId);

        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting task', error });
    }
});

module.exports = { createTask, updateTask, taskStatus, getFilteredAndSearchedTasks, deleteTask }