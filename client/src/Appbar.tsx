import { Box, IconButton, Drawer } from '@mui/material';
import React from 'react';
import { useReactiveVar } from '@apollo/client';
import { colVar, userVar } from './cache';
import icon from './favicon-32x32.png';
import AddIcon from '@mui/icons-material/Add';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import MapIcon from '@mui/icons-material/Map';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import BoltIcon from '@mui/icons-material/Bolt';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import { Col } from './types/Col';

export default function Appbar() {
  const userDetail = useReactiveVar(userVar);
  const colDetail = useReactiveVar(colVar);

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

  const mapColsToItems = (col: Col, i: number) => {
    return (
      <Box key={'appbar-col-'+i} sx={{
        padding: '5px',
      }}>
        <IconButton size='small' sx={{
          fontSize: 32,
        }}>
          { mapPathnameToIcon(col.pathname) }
        </IconButton>
      </Box>
    )
  }

  const handleAddClick = (event: React.MouseEvent) => {
    colVar({
      ...colDetail,
      isAdding: !colDetail.isAdding,
    })
  }
  
  return (
    <Drawer variant='permanent'>
      <Box sx={{
        textAlign: 'center'
      }}>
        <Box sx={{
          padding: '5px',
          paddingTop: '10px',
        }}>
          <IconButton size='small'>
            <img src={icon}/>
          </IconButton>
        </Box>
        {
          colDetail.cols.map(mapColsToItems)
        }
        <Box sx={{
          borderTop: '1px solid lavender',
          padding: '5px',
          position: 'relative',
        }}>
          <IconButton size='small' onClick={handleAddClick} sx={{
            fontSize: 32
          }}>
            <AddIcon fontSize='inherit' />
          </IconButton>
        </Box>
      </Box>
    </Drawer>
  );
}