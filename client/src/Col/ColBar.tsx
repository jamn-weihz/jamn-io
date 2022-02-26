import { useReactiveVar } from '@apollo/client';
import { Box, Card, IconButton } from '@mui/material';
import { colVar, paletteVar, sizeVar, userVar } from '../cache';
import { Col } from '../types/Col';
import { getColor } from '../utils';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import React, { useState } from 'react';
import { User } from '../types/User';
import { Jam } from '../types/Jam';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import MapIcon from '@mui/icons-material/Map';
import SearchIcon from '@mui/icons-material/Search';
import useRemoveCol from './useRemoveCol';
import CloseIcon from '@mui/icons-material/Close';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import useChangeCol from './useChangeCol';
import useShiftCol from './useShiftCol';
import { MOBILE_WIDTH } from '../constants';

interface ColBarProps {
  col: Col;
  user?: User;
  jam?: Jam;
}

export default function ColBar(props: ColBarProps) {
  const paletteDetail = useReactiveVar(paletteVar);
  const userDetail = useReactiveVar(userVar);
  const colDetail = useReactiveVar(colVar);
  const sizeDetail = useReactiveVar(sizeVar);

  const [showOptions, setShowOptions] = useState(false);
  const { removeCol } = useRemoveCol();
  const { changeCol } = useChangeCol();
  const { shiftCol: shiftColLeft } = useShiftCol(props.col, -1);
  const { shiftCol: shiftColRight } = useShiftCol(props.col, 1);

  const handleOptionsClick = (event: React.MouseEvent) => {
    setShowOptions(!showOptions);
  };

  const handleCloseClick = (event:React.MouseEvent) => {
    removeCol(props.col);
  };

  const handleAccountClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    const pathname = userDetail?.name
      ? `/u/${userDetail.name}`
      : '/register';
    changeCol(props.col, pathname)
  };

  const handleMapClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    changeCol(props.col, '/map');
  }

  const handleSearchClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    changeCol(props.col, '/search');
  }

  const handleBackClick = (event: React.MouseEvent) => {
    event.stopPropagation();
  }
  
  const handleForwardClick = (event: React.MouseEvent) => {
    event.stopPropagation();
  }

  const handleLeftClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    shiftColLeft();
  }
  
  const handleRightClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    shiftColRight();
  }

  let color = props.user?.color || props.jam?.color || getColor(paletteDetail.mode);

  let n = userDetail?.id
    ? userDetail.cols.filter(col => !col.deleteDate).length
    : colDetail.cols.length;

  return (
    <Card elevation={5}>
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: 1,
        color,
      }}>
        <Box sx={{
          maxWidth: sizeDetail.width < MOBILE_WIDTH
            ? '150px'
            : '220px'
        }}>
          {props.col.pathname.split('/').slice(0, 3).join('/')}
        </Box>
        <Box sx={{
          whiteSpace: 'nowrap',
        }}>
          <IconButton size='small' onClick={handleAccountClick} sx={{
            color,
            fontSize: 20,
            padding: 0,
          }}>
            <AccountCircleIcon fontSize='inherit'/>
          </IconButton>
          &nbsp;&nbsp;&nbsp;
          <IconButton size='small' onClick={handleMapClick} sx={{
            color,
            fontSize: 20,
            padding: 0,
          }}>
            <MapIcon fontSize='inherit'/>
          </IconButton>
          &nbsp;&nbsp;&nbsp;
          <IconButton size='small' onClick={handleSearchClick} sx={{
            color,
            fontSize: 20,
            padding: 0,
          }}>
            <SearchIcon fontSize='inherit'/>
          </IconButton>
          &nbsp;&nbsp;
          <IconButton size='small' onClick={handleOptionsClick} sx={{
            color,
            fontSize: 20,
            padding: 0,
          }}>
            <MoreVertIcon fontSize='inherit'/> 
          </IconButton>
        </Box>
    
      </Box>
      <Box sx={{
        display: showOptions ? 'flex' : 'none',
        flexDirection: 'row',
        justifyContent: 'space-between',
        color,
        borderTop: '1px solid',
        borderColor: getColor(paletteDetail.mode, true),
        padding: 1,
      }}>
        <Box>
          <IconButton disabled={props.col.i === 0} size='small' onClick={handleLeftClick} sx={{
            fontSize: 20,
            padding:0
          }}>
            <ChevronLeftIcon fontSize='inherit'/>
          </IconButton>
        </Box>
        <Box>
          <IconButton size='small' onClick={handleCloseClick} sx={{
            fontSize: 20,
            padding: 0,
          }}>
            <CloseIcon fontSize='inherit'/>
          </IconButton>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          <IconButton size='small' onClick={handleBackClick} sx={{
            fontSize: 20,
            padding: 0,
          }}>
            <ArrowBackIcon fontSize='inherit'/>
          </IconButton>
          &nbsp;&nbsp;&nbsp;
          <IconButton size='small' onClick={handleForwardClick} sx={{
            fontSize: 20,
            padding: 0,
          }}>
            <ArrowForwardIcon fontSize='inherit'/>
          </IconButton>
        </Box>
        <Box>
          <IconButton disabled={props.col.i === n - 1} size='small' onClick={handleRightClick} sx={{
            fontSize: 20,
            padding:0
          }}>
            <ChevronRightIcon fontSize='inherit'/>
          </IconButton>
        </Box>
      </Box>
    </Card>
  )
}
