import { useReactiveVar } from '@apollo/client';
import { Box, Card, IconButton } from '@mui/material';
import { colVar, paletteVar, sizeVar, userVar } from '../cache';
import { Col, ColState } from '../types/Col';
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
  user?: User | null;
  jam?: Jam | null;
}

export default function ColBar(props: ColBarProps) {
  const paletteDetail = useReactiveVar(paletteVar);
  const userDetail = useReactiveVar(userVar);
  const colDetail = useReactiveVar(colVar);
  const sizeDetail = useReactiveVar(sizeVar);

  const { removeCol } = useRemoveCol(props.col);
  const { changeCol } = useChangeCol();
  const { shiftCol: shiftColLeft } = useShiftCol(props.col, -1);
  const { shiftCol: shiftColRight } = useShiftCol(props.col, 1);

  let colState = null as unknown as ColState;
  colDetail.colStates.some(colState_i => {
    if (colState_i.col.id === props.col.id) {
      colState = colState_i;
      return true;
    }
    return false;
  });

  const handleOptionsClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    colVar({
      ...colDetail,
      colStates: colDetail.colStates.map(colState_i => {
        if (colState_i.col.id === props.col.id) {
          return {
            ...colState_i,
            showOptions: !colState_i.showOptions,
          };
        }
        return colState_i;
      }),
    });
  };

  const handleCloseClick = (event:React.MouseEvent) => {
    removeCol();
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
    colVar({
      ...colDetail,
      colStates: colDetail.colStates.map(colState_i => {
        if (colState_i.col.id === props.col.id) {
          return {
            ...colState_i,
            col: {
              ...colState_i.col,
              pathname: colState_i.stack[colState_i.index - 1].pathname,
            },
            index: colState.index - 1,
          }
        }
        return colState_i;
      }),
    });
  }
  
  const handleForwardClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    colVar({
      ...colDetail,
      colStates: colDetail.colStates.map(colState_i => {
        if (colState_i.col.id === props.col.id) {
          return {
            ...colState_i,
            col: {
              ...colState.col,
              pathname: colState.stack[colState.index + 1].pathname,
            },
            index: colState.index + 1,
          };
        }
        return colState_i;
      }),
    });
  }

  const handleLeftClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    shiftColLeft();
  }
  
  const handleRightClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    shiftColRight();
  }

  let color = getColor(paletteDetail.mode);

  if (!colState) return null;

  return (
    <Card elevation={5}>
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: 1,
      }}>
        <Box sx={{
          maxWidth: sizeDetail.width < MOBILE_WIDTH
            ? '150px'
            : '220px',
          color:  props.user?.color || props.jam?.color,
          fontWeight: 'bold',
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
        display: colState.showOptions ? 'flex' : 'none',
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
          <IconButton disabled={colState.index <= 0} size='small' onClick={handleBackClick} sx={{
            fontSize: 20,
            padding: 0,
          }}>
            <ArrowBackIcon fontSize='inherit'/>
          </IconButton>
          &nbsp;&nbsp;&nbsp;
          <IconButton disabled={colState.index >= colState.stack.length - 1} size='small' onClick={handleForwardClick} sx={{
            fontSize: 20,
            padding: 0,
          }}>
            <ArrowForwardIcon fontSize='inherit'/>
          </IconButton>
        </Box>
        <Box>
          <IconButton disabled={props.col.i === colDetail.colStates.length - 1} size='small' onClick={handleRightClick} sx={{
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
