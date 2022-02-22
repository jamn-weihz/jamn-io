import { Box, Link } from '@mui/material';
import React from 'react';
import useLogout from './useLogout';

export default function Logout() {
  const { logoutUser } = useLogout();

  const handleLogoutClick = (event: React.MouseEvent) => {
    logoutUser();
  }

  return (
    <Box>
      <Link onClick={handleLogoutClick} sx={{
        cursor: 'pointer',
      }}>
        Logout
      </Link>
    </Box>
  )
}