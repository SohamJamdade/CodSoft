import React, { useEffect, useState } from 'react';
import { Container, Grid, Card, CardContent, Typography, Chip, CardActionArea, IconButton, Box, Divider, Paper, Tooltip, LinearProgress } from '@mui/material';
import { Link } from 'react-router-dom';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import AssignmentIcon from '@mui/icons-material/Assignment';
import TimerIcon from '@mui/icons-material/Timer'; // Added for the countdown
import API from '../api/api'; 
import AddProject from '../components/addprojects';

const Dashboard = () => {
  const [projects, setProjects] = useState([]);

  const fetchProjects = async () => {
    try {
      const { data } = await API.get('/projects');
      setProjects(data);
    } catch (err) {
      console.error("Error fetching projects:", err);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // 1. Task Counter Helper: Returns "X/Y Tasks Completed"
  const getTaskStats = (tasks) => {
    if (!tasks || tasks.length === 0) return "0/0 Tasks";
    const completed = tasks.filter(t => t.status === 'completed').length;
    return `${completed}/${tasks.length} Tasks Completed`;
  };

  // 2. Countdown Helper: Calculates days remaining
  const getDaysRemaining = (deadline) => {
    const today = new Date();
    const target = new Date(deadline);
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "Overdue";
    if (diffDays === 0) return "Due Today";
    return `${diffDays} Days Left`;
  };

  const handleDeleteProject = async (e, projectId) => {
    e.preventDefault();
    e.stopPropagation(); 
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        await API.delete(`/projects/${projectId}`); 
        fetchProjects(); 
      } catch (err) {
        console.error("Delete failed.", err);
      }
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      width: '100vw',
      bgcolor: '#05070a', 
      backgroundImage: `
        radial-gradient(at 0% 0%, rgba(63, 81, 181, 0.15) 0, transparent 50%), 
        radial-gradient(at 100% 100%, rgba(245, 0, 87, 0.08) 0, transparent 50%)
      `,
      display: 'flex'
    }}>
      {/* 1. Full-Height Glass Sidebar */}
      <Box sx={{ 
        width: 380, 
        height: '100vh', 
        p: 4, 
        borderRight: '1px solid rgba(255,255,255,0.05)',
        bgcolor: 'rgba(255,255,255,0.02)',
        backdropFilter: 'blur(20px)',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 100,
        display: { xs: 'none', md: 'block' }
      }}>
        <Typography variant="h4" sx={{ fontWeight: 900, color: 'white', mb: 1, letterSpacing: -1 }}>
          Project Hub
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', mb: 6 }}>
          {projects.length} Active Workspaces
        </Typography>

        <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 800, mb: 2, display: 'block' }}>
          Quick Create
        </Typography>
        <AddProject onProjectAdded={fetchProjects} />
      </Box>

      {/* 2. Main Scrollable Content */}
      <Box sx={{ 
        flexGrow: 1, 
        ml: { md: '380px' }, 
        p: { xs: 3, md: 8 },
        width: '100%'
      }}>
        <Box sx={{ mb: 6 }}>
          <Typography variant="h3" sx={{ fontWeight: 900, color: 'white', mb: 2 }}>
            Your Workspace
          </Typography>
          <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)', width: '100px', borderWidth: 2 }} />
        </Box>

        <Grid container spacing={4}>
          {projects.map((project) => {
            const daysLeft = getDaysRemaining(project.endDate); //
            const taskStats = getTaskStats(project.tasks); //
            const progress = project.tasks?.length ? Math.round((project.tasks.filter(t => t.status === 'completed').length / project.tasks.length) * 100) : 0;

            return (
              <Grid item xs={12} sm={6} lg={4} xl={3} key={project._id}>
                <Card sx={{ 
                  position: 'relative', 
                  height: '100%', 
                  borderRadius: 6, 
                  bgcolor: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  transition: '0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': { 
                    transform: 'translateY(-8px)', 
                    bgcolor: 'rgba(255,255,255,0.05)',
                    borderColor: 'primary.main',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
                  }
                }}>
                  {/* Delete Button on Top Right */}
                  <Tooltip title="Delete Project">
                    <IconButton 
                      onClick={(e) => handleDeleteProject(e, project._id)}
                      sx={{ 
                        position: 'absolute', top: 15, right: 15, zIndex: 10,
                        color: 'rgba(255,255,255,0.2)',
                        '&:hover': { color: '#ff4444', bgcolor: 'rgba(255,68,68,0.1)' } 
                      }}
                    >
                      <DeleteForeverIcon />
                    </IconButton>
                  </Tooltip>

                  <CardActionArea component={Link} to={`/project/${project._id}`} sx={{ height: '100%' }}>
                    <CardContent sx={{ p: 4 }}>
                      {/* Added Countdown Badge */}
                      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Chip 
                          label="MERN PROJECT" 
                          size="small" 
                          sx={{ bgcolor: 'rgba(63, 81, 181, 0.2)', color: 'primary.light', fontWeight: 900, fontSize: 10 }} 
                        />
                        <Chip 
                          icon={<TimerIcon style={{ fontSize: '1rem', color: 'inherit' }} />}
                          label={daysLeft}
                          size="small"
                          sx={{ 
                            fontWeight: 800, 
                            fontSize: 10, 
                            bgcolor: daysLeft === "Overdue" ? 'rgba(244, 67, 54, 0.2)' : 'rgba(255,255,255,0.05)', 
                            color: daysLeft === "Overdue" ? '#ff4444' : 'rgba(255,255,255,0.5)'
                          }}
                        />
                      </Box>

                      <Typography variant="h5" sx={{ fontWeight: 800, color: 'white', mb: 1 }}>
                        {project.name}
                      </Typography>

                      {/* Added Task Counter Text */}
                      <Typography variant="caption" sx={{ color: 'primary.light', fontWeight: 800, display: 'block', mb: 2 }}>
                        {taskStats}
                      </Typography>

                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', mb: 4, minHeight: '4.5em' }}>
                        {project.description}
                      </Typography>
                      
                      {/* Added Visual Progress Bar */}
                      <Box sx={{ mb: 3 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={progress} 
                          sx={{ height: 6, borderRadius: 5, bgcolor: 'rgba(255,255,255,0.05)' }} 
                        />
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 2, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <Chip label={project.status} color="primary" variant="outlined" size="small" sx={{ borderRadius: 1.5, fontWeight: 700 }} />
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)', fontWeight: 700 }}>
                          {new Date(project.endDate).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    </Box>
  );
};

export default Dashboard;