// src/components/layout/Navbar.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Button,
  Tooltip,
  MenuItem,
  useTheme,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  ListItemIcon
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import PersonIcon from '@mui/icons-material/Person';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LockIcon from '@mui/icons-material/Lock';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  
  // Mobile drawer state
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // User menu state
  const [anchorElUser, setAnchorElUser] = useState(null);
  
  // Pages that show in the main navigation
  const pages = [
    { title: 'Home', path: '/' },
    { title: 'Books', path: '/books' },
    // Add more pages as needed
  ];
  
  // Admin pages
  const adminPages = [
    { title: 'Dashboard', path: '/admin', icon: <DashboardIcon /> },
    { title: 'Manage Books', path: '/admin/books', icon: <AutoStoriesIcon /> },
    // Add more admin pages as needed
  ];
  
  // User menu options based on authentication status
  const userMenuOptions = isAuthenticated
    ? [
        { title: 'Profile', path: '/profile', icon: <PersonIcon />, onClick: () => navigate('/profile') },
        { title: 'Change Password', path: '/profile/change-password', icon: <LockIcon />, onClick: () => navigate('/profile/change-password') },
        { title: 'Logout', icon: <LogoutIcon />, onClick: handleLogout },
      ]
    : [
        { title: 'Login', path: '/login', icon: <LoginIcon />, onClick: () => navigate('/login') },
        { title: 'Register', path: '/register', icon: <PersonIcon />, onClick: () => navigate('/register') },
      ];
  
  // Handle mobile drawer toggle
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  
  // Handle user menu open
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };
  
  // Handle user menu close
  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };
  
  // Handle logout
  function handleLogout() {
    logout();
    handleCloseUserMenu();
  }
  
  // Mobile drawer content
  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography
        variant="h6"
        noWrap
        component={Link}
        to="/"
        sx={{
          my: 2,
          fontFamily: 'monospace',
          fontWeight: 700,
          letterSpacing: '.3rem',
          color: 'inherit',
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <AutoStoriesIcon sx={{ mr: 1 }} />
        BOOKREADS
      </Typography>
      <Divider />
      <List>
        {/* Main Navigation Links */}
        {pages.map((page) => (
          <ListItem key={page.title} disablePadding>
            <ListItemButton 
              component={Link} 
              to={page.path}
              sx={{ textAlign: 'center' }}
            >
              <ListItemText primary={page.title} />
            </ListItemButton>
          </ListItem>
        ))}
        
        {/* Authentication Links (when not authenticated) */}
        {!isAuthenticated && (
          <>
            <Divider />
            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                to="/login"
                sx={{ textAlign: 'center' }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <LoginIcon />
                </ListItemIcon>
                <ListItemText primary="Login" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                to="/register"
                sx={{ textAlign: 'center' }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <PersonIcon />
                </ListItemIcon>
                <ListItemText primary="Register" />
              </ListItemButton>
            </ListItem>
          </>
        )}
        
        {/* User Profile Links (when authenticated) */}
        {isAuthenticated && (
          <>
            <Divider />
            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                to="/profile"
                sx={{ textAlign: 'center' }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <PersonIcon />
                </ListItemIcon>
                <ListItemText primary="My Profile" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                to="/profile/change-password"
                sx={{ textAlign: 'center' }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <LockIcon />
                </ListItemIcon>
                <ListItemText primary="Change Password" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                onClick={logout}
                sx={{ textAlign: 'center' }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText primary="Logout" />
              </ListItemButton>
            </ListItem>
          </>
        )}
        
        {/* Admin Links (when authenticated as admin) */}
        {isAdmin && (
          <>
            <Divider />
            <Typography 
              variant="subtitle2" 
              sx={{ mt: 2, mb: 1, color: 'text.secondary', pl: 2 }}
            >
              Admin
            </Typography>
            {adminPages.map((page) => (
              <ListItem key={page.title} disablePadding>
                <ListItemButton 
                  component={Link} 
                  to={page.path}
                  sx={{ textAlign: 'center' }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {page.icon}
                  </ListItemIcon>
                  <ListItemText primary={page.title} />
                </ListItemButton>
              </ListItem>
            ))}
          </>
        )}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="static" elevation={0} sx={{ backgroundColor: theme.palette.background.paper, color: theme.palette.text.primary }}>
        <Container maxWidth="lg">
          <Toolbar disableGutters>
            {/* Logo and Brand - Desktop */}
            <Typography
              variant="h6"
              noWrap
              component={Link}
              to="/"
              sx={{
                mr: 2,
                display: { xs: 'none', md: 'flex' },
                fontFamily: 'monospace',
                fontWeight: 700,
                letterSpacing: '.3rem',
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              <AutoStoriesIcon sx={{ mr: 1 }} />
              BOOKREADS
            </Typography>

            {/* Mobile menu icon */}
            <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
              <IconButton
                size="large"
                aria-label="navigation menu"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleDrawerToggle}
                color="inherit"
              >
                <MenuIcon />
              </IconButton>
            </Box>

            {/* Logo and Brand - Mobile */}
            <Typography
              variant="h5"
              noWrap
              component={Link}
              to="/"
              sx={{
                mr: 2,
                display: { xs: 'flex', md: 'none' },
                flexGrow: 1,
                fontFamily: 'monospace',
                fontWeight: 700,
                letterSpacing: '.3rem',
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              <AutoStoriesIcon sx={{ mr: 1 }} />
              BOOKREADS
            </Typography>

            {/* Desktop navigation */}
            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
              {pages.map((page) => (
                <Button
                  key={page.title}
                  component={Link}
                  to={page.path}
                  sx={{ 
                    my: 2, 
                    color: 'text.primary', 
                    display: 'block',
                    '&:hover': {
                      color: 'primary.main',
                      background: 'transparent',
                    }
                  }}
                >
                  {page.title}
                </Button>
              ))}
              
              {/* Admin navigation */}
              {isAdmin && adminPages.map((page) => (
                <Button
                  key={page.title}
                  component={Link}
                  to={page.path}
                  sx={{ 
                    my: 2, 
                    color: 'primary.main', 
                    display: 'block',
                    '&:hover': {
                      color: 'primary.dark',
                      background: 'transparent',
                    }
                  }}
                  startIcon={page.icon}
                >
                  {page.title}
                </Button>
              ))}
            </Box>

            {/* Authentication buttons (when not logged in) - Desktop */}
            {!isAuthenticated && (
              <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1, mr: 2 }}>
                <Button
                  component={Link}
                  to="/login"
                  variant="outlined"
                  color="primary"
                  startIcon={<LoginIcon />}
                >
                  Login
                </Button>
                <Button
                  component={Link}
                  to="/register"
                  variant="contained"
                  color="primary"
                  startIcon={<PersonIcon />}
                >
                  Register
                </Button>
              </Box>
            )}

            {/* User menu */}
            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title={isAuthenticated ? "Account settings" : "Authentication"}>
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar 
                    alt={user?.username || 'Guest'} 
                    sx={{ 
                      bgcolor: isAuthenticated ? 'primary.main' : 'grey.500',
                      width: 36,
                      height: 36
                    }}
                  >
                    {user?.username?.charAt(0).toUpperCase() || 'G'}
                  </Avatar>
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: '45px' }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                {isAuthenticated && (
                  <Box sx={{ px: 2, py: 1, minWidth: 180 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {user?.username}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {isAdmin && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                          <AdminPanelSettingsIcon fontSize="small" sx={{ mr: 0.5, color: 'primary.main' }} />
                          Administrator
                        </Box>
                      )}
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                  </Box>
                )}
                
                {userMenuOptions.map((option) => (
                  <MenuItem 
                    key={option.title} 
                    onClick={() => {
                      option.onClick();
                      handleCloseUserMenu();
                    }}
                    sx={{ minWidth: 180 }}
                  >
                    <ListItemIcon>{option.icon}</ListItemIcon>
                    <Typography textAlign="left">{option.title}</Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 280 },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Navbar;
