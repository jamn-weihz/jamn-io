import { Box, IconButton } from '@mui/material';
import React from 'react';
import { useReactiveVar } from '@apollo/client';
import { colVar, paletteVar, sizeVar, userVar } from './cache';
import icon32 from './favicon-32x32.png';
import icon16 from './favicon-16x16.png';
import AddIcon from '@mui/icons-material/Add';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import MapIcon from '@mui/icons-material/Map';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import BoltIcon from '@mui/icons-material/Bolt';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import { Col, ColState } from './types/Col';
import { DEFAULT_COLOR, MOBILE_WIDTH } from './constants';
import { useNavigate } from 'react-router-dom';
import { getAppbarWidth, getColor, getColWidth } from './utils';
import Brightness4Icon from '@mui/icons-material/Brightness4';

interface AppbarProps {
  containerEl: React.MutableRefObject<HTMLElement | undefined>;
}
export default function AppBar(props: AppbarProps) {
  const navigate = useNavigate();

  const userDetail = useReactiveVar(userVar);
  const colDetail = useReactiveVar(colVar);
  const sizeDetail = useReactiveVar(sizeVar);
  const paletteDetail = useReactiveVar(paletteVar);

  const handleItemClick = (col: Col) => (event: React.MouseEvent) => {
    event.stopPropagation();
    colVar({
      ...colDetail,
      i: col.i,
      isAdding: false
    });
    navigate(col.pathname);
    props.containerEl.current?.scrollTo({
      left: col.i * (getColWidth(sizeDetail.width) + 2),
      behavior: 'smooth',
    })
  };

  const mapPathnameToIcon = (pathname: string) => {
    const path = pathname.split('/');
    if (path[1] === 'register' || path[1] === 'login') {
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
    else if (path[1] === 'j') {
      return <BoltIcon fontSize='inherit' />
    }
    else if (path[1] === 'map') {
      return <MapIcon fontSize='inherit'/>;
    }
    else if (path[1] === 'search') {
      return <SearchIcon fontSize='inherit'/>;
    }
    return <QuestionMarkIcon fontSize='inherit'/>;
  }

  const mapColStateToItem = (colState: ColState, i: number) => {
    return (
      <Box key={'appbar-col-'+i} sx={{
        padding: '5px',
      }}>
        <IconButton size='small' onClick={handleItemClick(colState.col)} sx={{
          fontSize: sizeDetail.width < MOBILE_WIDTH ? 16 : 32,
          color: i === colDetail.i
            ? userDetail?.color || DEFAULT_COLOR
            : getColor(paletteDetail.mode),
          border: i === colDetail.i
            ? `1px solid ${userDetail?.color || DEFAULT_COLOR}`
            : 'none',
        }}>
          { mapPathnameToIcon(colState.col.pathname) }
        </IconButton>
      </Box>
    )
  }

  const handleAddClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    colVar({
      ...colDetail,
      isAdding: !colDetail.isAdding,
    })
  }
  
  const handleClick =  (event: React.MouseEvent) => {
    colVar({
      ...colDetail,
      isAdding: false,
    })
  }
  const handlePaletteClick = (event:React.MouseEvent) => {
    paletteVar({
      mode: paletteDetail.mode === 'dark'
        ? 'light'
        : 'dark',
    })
  }
  return (
    <Box onClick={handleClick} sx={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      textAlign: 'center',
      height: '100%',
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
          <IconButton size='small'>
            <img src={sizeDetail.width < MOBILE_WIDTH ? icon16 : icon32}/>
          </IconButton>
        </Box>
        <Box>
          {
            colDetail.colStates.map(mapColStateToItem)
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
            color: colDetail.isAdding
              ? userDetail?.color || DEFAULT_COLOR
              : getColor(paletteDetail.mode),
              border: colDetail.isAdding
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
        <IconButton size='small' onClick={handlePaletteClick} sx={{
          fontSize: sizeDetail.width < MOBILE_WIDTH ? 16: 32,
          color: getColor(paletteDetail.mode)
        }}>
          <Brightness4Icon fontSize='inherit'/>
        </IconButton>
      </Box>
    </Box>
  );
}