const express = require('express');
const router = express.Router();
// Corrected paths to lowercase
const Task = require('../models/task');
const Project = require('../models/project');

// Create a Task & Assign it to a Project
router.post('/', async (req, res) => {
    try {
        const { projectId, title, description, deadline, status } = req.body;

        const newTask = new Task({ projectId, title, description, deadline, status });
        const savedTask = await newTask.save();

        // Push Task ID into Project's tasks array
        await Project.findByIdAndUpdate(projectId, {
            $push: { tasks: savedTask._id }
        });

        res.status(201).json(savedTask);
    } catch (error) {
        res.status(500).json({ message: "Error creating task", error: error.message });
    }
});

// Update Task Status (Progress Tracking)
router.patch('/:id', async (req, res) => {
    try {
        const updatedTask = await Task.findByIdAndUpdate(
            req.params.id, 
            { status: req.body.status }, 
            { new: true }
        );
        res.status(200).json(updatedTask);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;