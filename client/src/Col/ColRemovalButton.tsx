import { Box, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import React from 'react';
import useRemoveCol from './useRemoveCol';
import { Col } from '../types/Col';

interface ColRemovalButtonProps{
  col: Col
}
export default function ColRemovalButton(props: ColRemovalButtonProps) {
  const { removeCol } = useRemoveCol();

  const handleCloseClick = (event:React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    removeCol(props.col);
  }
  
  return (
    <Box>
      <IconButton size='small' onClick={handleCloseClick} sx={{
        fontSize: 12,
      }}>
        <CloseIcon fontSize='inherit'/>
      </IconButton>
    </Box>
  )
}