import { useReactiveVar } from '@apollo/client';
import { Card, IconButton } from '@mui/material';
import React from 'react';
import { colVar, userVar } from '../cache';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import MapIcon from '@mui/icons-material/Map';
import SearchIcon from '@mui/icons-material/Search';
import useAddCol from './useAddCol';
import { sizeVar } from '../cache';
import { MOBILE_WIDTH } from '../constants';

interface ColAdderProps {
  containerEl: React.MutableRefObject<HTMLElement | undefined>;
}
export default function ColAdder(props: ColAdderProps) {
  const userDetail = useReactiveVar(userVar);
  const colDetail = useReactiveVar(colVar);
  const sizeDetail = useReactiveVar(sizeVar);

  const { addCol } = useAddCol(props.containerEl);

  const handleAddClick = (pathname: string) => (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    addCol(pathname);
  };

  const colCount = colDetail.colStates.length

  const left = sizeDetail.width < MOBILE_WIDTH
    ? 40
    : 56;
  const top = 
    (sizeDetail.width < MOBILE_WIDTH ? 36 : 52) * 
    (colCount + 1) + 7
  return (
    <Card elevation={10} sx={{
      position: 'fixed',
      display: colDetail.isAdding ? 'flex' : 'none',
      left, 
      top,
      padding: 1,
      flexDirection: 'row'
    }}>
      <IconButton size='small' onClick={handleAddClick(userDetail?.id ? `/u/${userDetail.name}` : '/register')} sx={{
        fontSize: sizeDetail.width < MOBILE_WIDTH ? 16 : 32,
      }}>
        <AccountCircleIcon fontSize='inherit'/>
      </IconButton>
      <IconButton size='small' onClick={handleAddClick('/map')} sx={{
        fontSize: sizeDetail.width < MOBILE_WIDTH ? 16 : 32,
      }}>
        <MapIcon fontSize='inherit'/>
      </IconButton>
      <IconButton size='small' onClick={handleAddClick('/search')} sx={{
        fontSize: sizeDetail.width < MOBILE_WIDTH ? 16 : 32,
      }}>
        <SearchIcon fontSize='inherit'/>
      </IconButton>
    </Card>
  )
}