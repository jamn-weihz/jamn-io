import { AppBar, Box, Toolbar, Typography, IconButton } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import MapIcon from '@mui/icons-material/Map';
import React from 'react';
import { useReactiveVar } from '@apollo/client';
import { userVar } from './cache';
import { useNavigate } from 'react-router-dom';

export default function Appbar() {
  const navigate = useNavigate();

  const userDetail = useReactiveVar(userVar);

  const handleMapClick = (event: React.MouseEvent) => {
    navigate('/');
  };

  const handleAccountClick = (event: React.MouseEvent) => {
    if (userDetail.user?.id) {
      navigate(`/u/${decodeURIComponent(userDetail.user.name)}`);
    }
    else {
      navigate('/register');
    }
  };
  
  return (
    <AppBar sx={{position: 'fixed'}}>
      <Toolbar variant='dense' disableGutters={true} sx={{
        display: 'flex',
        justifyContent: 'space-between',
        paddingLeft: 2,
        paddingRight: 2,
      }}>
        <Typography variant='overline' color='inherit'>
          JAMN.io
        </Typography>
        <Box>
          <IconButton size='small' color='inherit' onClick={handleMapClick}>
            <MapIcon fontSize='inherit'/>
          </IconButton>
          <IconButton size='small' color='inherit' onClick={handleAccountClick}>
            <AccountCircleIcon fontSize='inherit'/>
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}