const express = require('express');
const router = express.Router();
const Project = require('../models/project');
const Task = require('../models/task'); // Added Task model for cleanup

// Get all projects for the Dashboard
router.get('/', async (req, res) => {
    try {
        const projects = await Project.find().populate('tasks');
        res.status(200).json(projects);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get a single project by ID
router.get('/:id', async (req, res) => {
    try {
        const project = await Project.findById(req.params.id).populate('tasks');
        if (!project) return res.status(404).json({ message: "Project not found" });
        res.status(200).json(project);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create a new project
router.post('/', async (req, res) => {
    try {
        const newProject = new Project(req.body);
        const savedProject = await newProject.save();
        res.status(201).json(savedProject);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE a project and its associated tasks
router.delete('/:id', async (req, res) => {
  try {
    const projectId = req.params.id;

    // 1. Delete the Project
    const deletedProject = await Project.findByIdAndDelete(projectId);
    
    if (!deletedProject) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    // 2. Cascade Delete: Remove all tasks linked to this project
    await Task.deleteMany({ projectId: projectId });
    
    res.status(200).json({ message: "Project and associated tasks deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;