import { useReactiveVar } from '@apollo/client';
import { Box, Snackbar } from '@mui/material';
import { useEffect } from 'react';
import { snackbarVar } from '../cache';
import useLogout from './useLogout';

export default function UnauthorizedSnackBar() {
  const authDetail = useReactiveVar(snackbarVar);
  const { logoutUser } = useLogout();

  useEffect(() => {
    if (authDetail.isUnauthorized) {
      logoutUser();
    }
  }, [authDetail.isUnauthorized]);

  const handleClose = () => {
    snackbarVar({
      isUnauthorized: false,
      isSessionExpired: false,
    });
  };

  return (
    <Box>
      <Snackbar
        open={authDetail.isUnauthorized}
        autoHideDuration={3000}
        onClose={handleClose}
        message={'Unauthorized. Please login again.'}
      />
      <Snackbar
        open={authDetail.isSessionExpired}
        autoHideDuration={3000}
        onClose={handleClose}
        message={'Session expired. Please login again.'}
      />
    </Box>

  );
}