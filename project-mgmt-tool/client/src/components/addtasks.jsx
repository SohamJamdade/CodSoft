import React, { useState } from 'react';
import { TextField, Button, Box } from '@mui/material';
import API from '../api/api';

const AddTasks = ({ projectId, onTaskAdded }) => {
  const [title, setTitle] = useState('');
  const [deadline, setDeadline] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/tasks', {
        projectId,
        title,
        deadline,
        status: 'pending'
      });
      setTitle('');
      setDeadline('');
      onTaskAdded(); // Refresh the list in ProjectDetail
    } catch (err) {
      console.error("Error adding task:", err);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
      <TextField 
        label="Task Name" 
        size="small" 
        value={title} 
        onChange={(e) => setTitle(e.target.value)} 
        required 
      />
      <TextField 
        type="date" 
        size="small" 
        InputLabelProps={{ shrink: true }} 
        label="Deadline" 
        value={deadline} 
        onChange={(e) => setDeadline(e.target.value)} 
        required 
      />
      <Button variant="contained" type="submit">Assign Task</Button>
    </Box>
  );
};

export default AddTasks;