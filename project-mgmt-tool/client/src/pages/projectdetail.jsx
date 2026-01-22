import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Paper, Button, Divider, List, ListItem, ListItemText, Chip, Box } from '@mui/material';
import API from '../api/api';
import AddTasks from '../components/addtasks';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      const response = await API.get(`/projects/${id}`);
      setProject(response.data);
    } catch (error) {
      console.error('Error fetching project details:', error);
    } finally {
      setLoading(false);
    }
  };

  // Logic to update task status in the database
  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      await API.patch(`/tasks/${taskId}`, { status: newStatus });
      fetchProjectDetails(); // Refresh list to show updated status
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  if (loading) return <Typography sx={{ p: 5 }}>Loading project details...</Typography>;
  if (!project) return <Typography sx={{ p: 5 }}>Project not found.</Typography>;

  return (
    <Container sx={{ py: 5 }}>
      <Button onClick={() => navigate('/')} sx={{ mb: 2 }}>
        ← Back to Dashboard
      </Button>

      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" fontWeight="bold">
            {project.name}
          </Typography>
          <Chip label={project.status} color="primary" variant="filled" />
        </Box>

        <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
          {project.description}
        </Typography>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
          Assign New Task
        </Typography>
        <AddTasks projectId={id} onTaskAdded={fetchProjectDetails} />

        <Typography variant="h5" sx={{ mt: 4, mb: 2, fontWeight: 'bold' }}>
          Tasks List
        </Typography>
        
        <List>
          {project.tasks && project.tasks.length > 0 ? (
            project.tasks.map((task) => (
              <ListItem
                key={task._id}
                divider
                secondaryAction={
                  <Button
                    size="small"
                    variant="contained"
                    color={task.status === 'completed' ? 'success' : 'warning'}
                    onClick={() => handleUpdateTaskStatus(task._id, task.status === 'completed' ? 'pending' : 'completed')}
                  >
                    {task.status === 'completed' ? 'Done' : 'Mark Done'}
                  </Button>
                }
              >
                <ListItemText
                  primary={task.title}
                  secondary={`Status: ${task.status} | Deadline: ${new Date(task.deadline).toLocaleDateString()}`}
                />
              </ListItem>
            ))
          ) : (
            <Typography color="textSecondary" sx={{ fontStyle: 'italic', mt: 2 }}>
              No tasks assigned to this project yet.
            </Typography>
          )}
        </List>
      </Paper>
    </Container>
  );
};

export default ProjectDetail;