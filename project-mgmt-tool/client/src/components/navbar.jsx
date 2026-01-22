import React from 'react';
import { AppBar, Toolbar, Typography, Button } from "@mui/material"; // Fixed spellings
import { Link } from "react-router-dom"; // Link must be capitalized

const Navbar = () => {
    return (
        <AppBar position="static" sx={{ mb: 4 }}>
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    Project Management Dashboard
                </Typography>
                {/* Fixed component={Link} capitalization */}
                <Button color="inherit" component={Link} to="/">Dashboard</Button>
            </Toolbar>
        </AppBar>
    );
}

export default Navbar;