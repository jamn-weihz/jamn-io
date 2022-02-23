import { Card, Link } from '@mui/material';
import React from 'react';
import useLogout from './useLogout';

export default function Logout() {
  const { logoutUser } = useLogout();

  const handleLogoutClick = (event: React.MouseEvent) => {
    logoutUser();
  }

  return (
    <Card elevation={5} sx={{
      margin:1,
      padding:1,
    }}>
      <Link onClick={handleLogoutClick} sx={{
        cursor: 'pointer',
      }}>
        Logout
      </Link>
    </Card>
  )
}