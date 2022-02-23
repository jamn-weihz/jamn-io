import { Box, IconButton, Drawer } from '@mui/material';
import React from 'react';
import { useReactiveVar } from '@apollo/client';
import { colVar, sizeVar, userVar } from './cache';
import icon32 from './favicon-32x32.png';
import icon16 from './favicon-16x16.png';
import AddIcon from '@mui/icons-material/Add';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import MapIcon from '@mui/icons-material/Map';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import BoltIcon from '@mui/icons-material/Bolt';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import { Col } from './types/Col';
import { DEFAULT_COLOR } from './constants';
import { useNavigate } from 'react-router-dom';
import { getColWidth } from './utils';

interface AppbarProps {
  containerEl: React.MutableRefObject<HTMLElement | undefined>;
}
export default function Appbar(props: AppbarProps) {
  const navigate = useNavigate();

  const userDetail = useReactiveVar(userVar);
  const colDetail = useReactiveVar(colVar);
  const sizeDetail = useReactiveVar(sizeVar);
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

  const mapColsToItems = (col: Col, i: number) => {
    return (
      <Box key={'appbar-col-'+i} sx={{
        padding: '5px',
      }}>
        <IconButton size='small' onClick={handleItemClick(col)} sx={{
          fontSize: sizeDetail.width < 400 ? 16 : 32,
          color: i === colDetail.i
            ? userDetail?.color || DEFAULT_COLOR
            : 'secondary',
          border: i === colDetail.i
            ? `1px solid ${userDetail?.color || DEFAULT_COLOR}`
            : 'none',
        }}>
          { mapPathnameToIcon(col.pathname) }
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
  return (
    <Drawer variant='permanent'>
      <Box onClick={handleClick} sx={{
        textAlign: 'center',
        height: '100%',
      }}>
        <Box sx={{
          padding: '5px',
          paddingTop: '10px',
        }}>
          <IconButton size='small'>
            <img src={sizeDetail.width < 400 ? icon16 : icon32}/>
          </IconButton>
        </Box>
        {
          userDetail?.id
            ? userDetail.cols
                .filter(col => !col.deleteDate)
                .sort((a,b) => a.i < b.i ? -1 :1 )
                .map(mapColsToItems)
            : colDetail.cols.map(mapColsToItems)
        }
        <Box sx={{
          borderTop: '1px solid lavender',
          padding: '5px',
          position: 'relative',
        }}>
          <IconButton size='small' onClick={handleAddClick} sx={{
            fontSize: sizeDetail.width < 400 ? 16 : 32,
            color: colDetail.isAdding
              ? userDetail?.color || DEFAULT_COLOR
              : 'secondary',
            border: colDetail.isAdding
              ? `1px solid ${userDetail?.color || DEFAULT_COLOR}`
              : 'none',
          }}>
            <AddIcon fontSize='inherit' />
          </IconButton>
        </Box>
      </Box>
    </Drawer>
  );
}