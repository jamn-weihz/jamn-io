import { useReactiveVar } from '@apollo/client';
import { Box, Card, IconButton } from '@mui/material';
import { paletteVar, sizeVar, userVar } from '../cache';
import { ColUnit } from '../types/Col';
import { getColor, getColWidth } from '../utils';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import React, { useContext, useState } from 'react';
import { User } from '../types/User';
import { Jam } from '../types/Jam';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import MapIcon from '@mui/icons-material/Map';
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled';
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
import { ColContext } from '../App';
interface ColBarProps {
  colUnit: ColUnit;
  user?: User | null;
  jam?: Jam | null;
}

export default function ColBar(props: ColBarProps) {
  const { state, dispatch } = useContext(ColContext);

  const paletteDetail = useReactiveVar(paletteVar);
  const userDetail = useReactiveVar(userVar);
  const sizeDetail = useReactiveVar(sizeVar);

  const { removeCol } = useRemoveCol(props.colUnit.col);
  const { changeCol } = useChangeCol(0, true);
  const { changeCol: changeColBack } = useChangeCol(-1, true);
  const { changeCol: changeColForward } = useChangeCol(1, true);
  const { shiftCol: shiftColLeft } = useShiftCol(props.colUnit.col, -1);
  const { shiftCol: shiftColRight } = useShiftCol(props.colUnit.col, 1);

  const handleOptionsClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    dispatch({
      type: 'TOGGLE_COL_OPTIONS',
      col: props.colUnit.col,
    })
  };

  const handleCloseClick = (event:React.MouseEvent) => {
    event.stopPropagation();
    removeCol();
  };

  const handleAccountClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    const pathname = userDetail?.name
      ? `/u/${userDetail.name}`
      : '/register';
    changeCol(props.colUnit.col, pathname)
  };

  const handleMapClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    changeCol(props.colUnit.col, '/map');
  }

  const handleStartClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    changeCol(props.colUnit.col, '/start');
  }

  const handleSearchClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    changeCol(props.colUnit.col, '/search');
  }

  const handleBackClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    const pathname = props.colUnit.stack[props.colUnit.index - 1].pathname;
    changeColBack(props.colUnit.col, pathname)
  }
  
  const handleForwardClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    const pathname = props.colUnit.stack[props.colUnit.index + 1].pathname;
    changeColForward(props.colUnit.col, pathname)
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

  return (
    <Card elevation={5}>
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: 1,
      }}>
        <Box sx={{
          maxWidth: sizeDetail.width < MOBILE_WIDTH
            ? getColWidth(sizeDetail.width) - 120
            : '220px',
          color:  props.user?.color || props.jam?.color || color,
          fontWeight: 'bold',
        }}>
          {props.colUnit.col.pathname.split('/').slice(0, 3).join('/')}
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
          <IconButton size='small' onClick={handleStartClick} sx={{
            color,
            fontSize: 20,
            padding: 0,
          }}>
            <PlayCircleFilledIcon fontSize='inherit'/>
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
        display: props.colUnit.showOptions ? 'flex' : 'none',
        flexDirection: 'row',
        justifyContent: 'space-between',
        color,
        borderTop: '1px solid',
        borderColor: getColor(paletteDetail.mode, true),
        padding: 1,
      }}>
        <Box>
          <IconButton disabled={props.colUnit.col.i === 0} size='small' onClick={handleLeftClick} sx={{
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
          <IconButton disabled={props.colUnit.index <= 0} size='small' onClick={handleBackClick} sx={{
            fontSize: 20,
            padding: 0,
          }}>
            <ArrowBackIcon fontSize='inherit'/>
          </IconButton>
          &nbsp;&nbsp;&nbsp;
          <IconButton disabled={props.colUnit.index >= props.colUnit.stack.length - 1} size='small' onClick={handleForwardClick} sx={{
            fontSize: 20,
            padding: 0,
          }}>
            <ArrowForwardIcon fontSize='inherit'/>
          </IconButton>
        </Box>
        <Box>
          <IconButton disabled={props.colUnit.col.i === state.colUnits.length - 1} size='small' onClick={handleRightClick} sx={{
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
