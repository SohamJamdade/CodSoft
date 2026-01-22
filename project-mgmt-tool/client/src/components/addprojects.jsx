import React, { useState } from 'react';
import { TextField, Button, Typography, Box, Paper, Alert } from '@mui/material'; // Added Paper and Alert
import API from '../api/api';

const AddProject = ({ onProjectAdded }) => {
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await API.post('/projects', {
        name: projectName,
        description: description,
        endDate: endDate,
        status: 'active' // Match this to your Mongoose enum ['active', 'completed', 'on-hold']
      });

      // Reset form
      setProjectName('');
      setDescription('');
      setEndDate('');

      if (onProjectAdded) {
        onProjectAdded();
      }
    } catch (err) {
      setError('Failed to create project. Check if the server is running.');
      console.error(err);
    }
  }; // End of handleSubmit

  return (
    <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 2 }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
        Start New Project
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField 
          label="Project Name" 
          variant="outlined"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          required 
        />
        <TextField 
          label="Description" 
          variant="outlined"
          multiline 
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <TextField 
          label="Deadline" 
          type="date" 
          InputLabelProps={{ shrink: true }}
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          required
        />
        <Button 
          variant="contained" 
          type="submit" 
          size="large"
          sx={{ py: 1.5, fontWeight: 'bold' }}
        >
          Create Project
        </Button>
      </Box>
    </Paper>
  );
};

export default AddProject;