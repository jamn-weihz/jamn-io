import { useReactiveVar } from '@apollo/client';
import { Card, IconButton } from '@mui/material';
import React, { Dispatch, SetStateAction } from 'react';
import { colVar, userVar } from '../cache';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import MapIcon from '@mui/icons-material/Map';
import SearchIcon from '@mui/icons-material/Search';
import useAddCol from './useAddCol';

interface ColAdderProps {
  containerEl: React.MutableRefObject<HTMLElement | undefined>;
}
export default function ColAdder(props: ColAdderProps) {
  const userDetail = useReactiveVar(userVar);
  const colDetail = useReactiveVar(colVar);

  const { addCol } = useAddCol(props.containerEl);

  const handleAddClick = (pathname: string) => (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    addCol(pathname);
    colVar({
      ...colDetail,
      isAdding: false,
    });
  }
  return (
    <Card elevation={10} sx={{
      position: 'fixed',
      display: colDetail.isAdding ? 'flex' : 'none',
      left: 56,
      top: 52 * (colDetail.cols.filter(col => !col.deleteDate).length + 1) + 7,
      padding: 1,
      flexDirection: 'row'
    }}>
      <IconButton size='small' onClick={handleAddClick(userDetail?.id ? `/u/${userDetail.name}` : '/register')} sx={{
        fontSize: 32,
      }}>
        <AccountCircleIcon fontSize='inherit'/>
      </IconButton>
      <IconButton size='small' onClick={handleAddClick('/map')} sx={{
        fontSize: 32,
      }}>
        <MapIcon fontSize='inherit'/>
      </IconButton>
      <IconButton size='small' onClick={handleAddClick('/search')} sx={{
        fontSize: 32,
      }}>
        <SearchIcon fontSize='inherit'/>
      </IconButton>
    </Card>
  )
}