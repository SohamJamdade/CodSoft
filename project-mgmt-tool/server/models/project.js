const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    endDate: { type: Date, required: true },
    status: { type: String, default: 'active' },
    tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'task' }]
});

// This must match the name you use in your 'require' statements
module.exports = mongoose.model('project', ProjectSchema);