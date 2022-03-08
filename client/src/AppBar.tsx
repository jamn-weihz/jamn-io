import { Box, IconButton } from '@mui/material';
import React, { useContext } from 'react';
import { useReactiveVar } from '@apollo/client';
import { paletteVar, sizeVar, userVar } from './cache';
import icon32 from './favicon-32x32.png';
import icon16 from './favicon-16x16.png';
import AddIcon from '@mui/icons-material/Add';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import MapIcon from '@mui/icons-material/Map';
import SearchIcon from '@mui/icons-material/Search';
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled';
import PersonIcon from '@mui/icons-material/Person';
import BoltIcon from '@mui/icons-material/Bolt';
import ChatBubbleTwoToneIcon from '@mui/icons-material/ChatBubbleTwoTone';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import { Col, ColUnit } from './types/Col';
import { DEFAULT_COLOR, MOBILE_WIDTH } from './constants';
import { getAppbarWidth, getColor } from './utils';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import InfoIcon from '@mui/icons-material/Info';
import { ColContext } from './App';
import { useNavigate } from 'react-router-dom';

interface AppbarProps {
}
export default function AppBar(props: AppbarProps) {
  const { state, dispatch } = useContext(ColContext);

  const navigate = useNavigate();

  const userDetail = useReactiveVar(userVar);
  const sizeDetail = useReactiveVar(sizeVar);
  const paletteDetail = useReactiveVar(paletteVar);

  const handleItemClick = (col: Col) => (event: React.MouseEvent) => {
    console.log(col);
    event.stopPropagation();

    if (state.i !== col.i) {
      dispatch({
        type: 'SELECT_COL',
        i: col.i,
        scroll: true,
        navigate: true,
      })
    }

  };

  const mapPathnameToIcon = (pathname: string) => {
    const path = pathname.split('/');
    if (path[1] === 'about') {
      return <InfoIcon fontSize='inherit' />
    }
    else if (path[1] === 'register' || path[1] === 'login') {
      return <AccountCircleIcon fontSize='inherit'/>;
    }
    else if (path[1] === 'u') {
      if (path[2].toLowerCase() === userDetail?.lowercaseName) {
        return <AccountCircleIcon fontSize='inherit'/>;
      }
      else {
        return <PersonIcon fontSize='inherit' />
      }
    }
    else if (path[1] === 'map') {
      return <MapIcon fontSize='inherit'/>;
    }
    else if (path[1] === 'start') {
      return <PlayCircleFilledIcon fontSize='inherit'/>;
    }
    else if (path[1] === 'search') {
      return <SearchIcon fontSize='inherit'/>;
    }
    else if (path[1] === 'j') {
      return <BoltIcon fontSize='inherit' />
    }
    else if (path[1] === 'p') {
      return <ChatBubbleTwoToneIcon fontSize='inherit' />
    }
    return <QuestionMarkIcon fontSize='inherit'/>;
  }

  const mapColUnitToButton = (colUnit: ColUnit) => {
    return (
      <Box key={'appbar-col-'+colUnit.col.id} sx={{
        padding: '5px',
      }}>
        <IconButton size='small' onClick={handleItemClick(colUnit.col)} sx={{
          fontSize: sizeDetail.width < MOBILE_WIDTH ? 16 : 32,
          color: colUnit.col.i === state.i
            ? userDetail?.color || DEFAULT_COLOR
            : getColor(paletteDetail.mode),
          border: colUnit.col.i === state.i
            ? `1px solid ${userDetail?.color || DEFAULT_COLOR}`
            : 'none',
        }}>
          { mapPathnameToIcon(colUnit.col.pathname) }
        </IconButton>
      </Box>
    )
  }

  const handleAddClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    dispatch({
      type: 'SHOW_ADDER',
    });
  };
  
  const handleClick = (event: React.MouseEvent) => {
    dispatch({
      type: 'HIDE_ADDER'
    });
  };

  const handlePaletteClick = (event: React.MouseEvent) => {
    paletteVar({
      mode: paletteDetail.mode === 'dark'
        ? 'light'
        : 'dark',
    })
  };

  const handleAboutClick = (event: React.MouseEvent) => {
    navigate('/about')
  };

  return (
    <Box onClick={handleClick} sx={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      textAlign: 'center',
      minHeight: '100%',
      width: getAppbarWidth(sizeDetail.width),
      backgroundColor: paletteDetail.mode === 'dark'
        ? '#202020'
        : ''
    }}>
      <Box>
        <Box sx={{
          padding: '5px',
          paddingTop: '10px',
        }}>
          <IconButton size='small' onClick={handleAboutClick}>
            <img src={sizeDetail.width < MOBILE_WIDTH ? icon16 : icon32}/>
          </IconButton>
        </Box>
        <Box>
          {
            state.colUnits.map(mapColUnitToButton)
          }
        </Box>
        <Box sx={{
          borderTop: '1px solid',
          borderColor: getColor(paletteDetail.mode, true),
          padding: '5px',
          position: 'relative',
        }}>
          <IconButton size='small' onClick={handleAddClick} sx={{
            fontSize: sizeDetail.width < MOBILE_WIDTH ? 16 : 32,
            color: state.showAdder
              ? userDetail?.color || DEFAULT_COLOR
              : getColor(paletteDetail.mode),
              border: state.showAdder
              ? `1px solid ${userDetail?.color || DEFAULT_COLOR}`
              : 'none',
          }}>
            <AddIcon fontSize='inherit' />
          </IconButton>
        </Box>
      </Box>
      <Box sx={{
        marginBottom: '5px',
        padding: '5px',
      }}>
        <IconButton 
          size='small' 
          onClick={handlePaletteClick}
          title='Toggle light/dark mode' 
          sx={{
            fontSize: sizeDetail.width < MOBILE_WIDTH ? 16: 32,
            color: getColor(paletteDetail.mode)
          }}
        >
          <Brightness4Icon fontSize='inherit'/>
        </IconButton>
      </Box>
    </Box>
  );
}