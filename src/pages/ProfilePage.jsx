import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Divider,
  Grid,
  Alert,
  CircularProgress,
  Chip,
  Avatar,
  Link as MuiLink
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import SecurityIcon from '@mui/icons-material/Security';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';

const ProfilePage = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState({
    id: '',
    username: '',
    email: '',
    status: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formErrors, setFormErrors] = useState({});

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const data = await authService.getUserProfile();
        setProfileData(data);
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('Failed to load user profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  // Handle field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value
    });

    // Clear field error when typing
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  // Validate form before submission
  const validateForm = () => {
    const errors = {};

    // Email validation
    if (!profileData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {
      errors.email = 'Email format is invalid';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      await authService.updateUserProfile({
        email: profileData.email
      });
      setSuccess('Profile updated successfully');
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.error || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setIsEditing(false);
    // Reset form errors
    setFormErrors({});
    // Fetch profile data again
    authService.getUserProfile()
      .then(data => setProfileData(data))
      .catch(err => console.error('Error refreshing profile data:', err));
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <PersonIcon sx={{ fontSize: 32, mr: 2, color: 'primary.main' }} />
          <Typography variant="h4" component="h1">
            My Profile
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        <Divider sx={{ mb: 4 }} />

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={3}>
            {/* User Basic Info */}
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    {profileData.username ? profileData.username[0].toUpperCase() : 'U'}
                  </Avatar>
                  <Typography variant="h6">Account Information</Typography>
                </Box>

                <Grid container spacing={2}>
                  {/* Username - Read only */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Username"
                      value={profileData.username}
                      InputProps={{ readOnly: true }}
                      variant="outlined"
                    />
                  </Grid>

                  {/* Email - Editable */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      value={profileData.email}
                      onChange={handleChange}
                      error={!!formErrors.email}
                      helperText={formErrors.email}
                      disabled={!isEditing || saving}
                      InputProps={{
                        readOnly: !isEditing,
                        startAdornment: isEditing ? null : (
                          <EmailIcon fontSize="small" sx={{ mr: 1, color: 'action.active' }} />
                        )
                      }}
                      variant="outlined"
                    />
                  </Grid>

                  {/* User Status */}
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <VerifiedUserIcon sx={{ mr: 1, color: 'success.main' }} />
                      <Typography variant="body1">
                        Status: 
                        <Chip 
                          label={profileData.status} 
                          color={profileData.status === 'ACTIVE' ? 'success' : 'default'}
                          size="small"
                          variant="outlined"
                          sx={{ ml: 1 }}
                        />
                      </Typography>
                    </Box>
                  </Grid>

                  {/* User Roles */}
                  {user && user.roles && (
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <SecurityIcon sx={{ mr: 1, color: 'info.main' }} />
                        <Typography variant="body1" sx={{ mr: 1 }}>
                          Roles:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {user.roles.map(role => (
                            <Chip
                              key={role}
                              label={role}
                              color="primary"
                              size="small"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </Paper>
            </Grid>

            {/* Buttons */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  component={Link}
                  to="/profile/change-password"
                  variant="outlined"
                  color="primary"
                  startIcon={<LockIcon />}
                >
                  Change Password
                </Button>

                <Box>
                  {isEditing ? (
                    <>
                      <Button
                        type="button"
                        variant="outlined"
                        color="secondary"
                        onClick={handleCancel}
                        disabled={saving}
                        sx={{ mr: 2 }}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={saving}
                      >
                        {saving ? (
                          <>
                            <CircularProgress size={24} sx={{ mr: 1 }} color="inherit" />
                            Saving...
                          </>
                        ) : 'Save Changes'}
                      </Button>
                    </>
                  ) : (
                    <Button
                      type="button"
                      variant="contained"
                      color="primary"
                      onClick={() => setIsEditing(true)}
                    >
                      Edit Profile
                    </Button>
                  )}
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default ProfilePage;
