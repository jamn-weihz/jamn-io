import { Box, Paper, } from '@mui/material';
import { ColUnit } from '../types/Col';
import Login from '../Auth/Login';
import Register from '../Auth/Register';
import User from '../User/User';
import Jam from '../Jam/Jam';
import Map from '../Map/Map';
import Search from '../Search/Search';
import React, { useContext } from 'react';
import { paletteVar, sizeVar } from '../cache';
import { useReactiveVar } from '@apollo/client';
import { getColor, getColWidth } from '../utils';
import ColBar from './ColBar';
import NotFound from '../NotFound';
import PostCol from '../Post/PostCol';
import { ColContext } from '../App';
import About from '../About';

interface ColComponentProps {
  colUnit: ColUnit;
}
export default function ColComponent(props: ColComponentProps) {

  const { state, dispatch } = useContext(ColContext);

  const sizeDetail = useReactiveVar(sizeVar);
  const paletteDetail = useReactiveVar(paletteVar);

  const handleClick = (event: React.MouseEvent) => {
    if (state.i !== props.colUnit.col.i) {
      dispatch({
        type: 'SELECT_COL',
        i: props.colUnit.col.i,
        scroll: false,
        navigate: true,
      });
    }
  }

  const mapColUnitToComponent = (colUnit: ColUnit) => {
    const path = colUnit.col.pathname.split('/');
    if (path[1] === 'about') {
      return <About colUnit={colUnit} />
    }
    else if (path[1] === 'register') {
      return <Register colUnit={colUnit}/>;
    }
    else if (path[1] === 'login') {
      return <Login colUnit={colUnit}/>;
    }
    else if (path[1] === 'map') {
      return <Map colUnit={colUnit}/>;
    }
    else if (path[1] === 'search') {
      return (
        <Search 
          colUnit={colUnit} 
        />
      );
    }
    else if (path[1] === 'u') {
      return (
        <User
          key={`user-${path[2]}-${colUnit.col.id}`}
          colUnit={colUnit} 
          name={path[2]} 
        />
      );
    }
    else if (path[1] === 'j') {
      return (
        <Jam 
          key={`jam-${path[2]}-${colUnit.col.id}`}
          colUnit={colUnit} 
          name={path[2]} 
        />
      );
    }
    else if (path[1] === 'p') {
      return (
        <PostCol
          key={`post-${path[2]}-${colUnit.col.id}`}
          colUnit={colUnit}
          id={path[2]}
        />
      )
    }
    else {
      return (
        <Box>
          <ColBar colUnit={props.colUnit} />
          <NotFound />
        </Box>
      )
    }
  }

  return (
    <Paper onClick={handleClick} sx={{
      border: '1px solid',
      borderColor: paletteDetail.mode === 'dark'
        ? 'black'
        : 'lavender',
      minWidth: getColWidth(sizeDetail.width),
      width: getColWidth(sizeDetail.width),
      height: '100%',
      position: 'relative',
      backgroundColor: state.i === props.colUnit.col.i
        ? paletteDetail.mode === 'dark'
          ? 'black'
          : 'azure'
        : 'none',
    }}>
      { mapColUnitToComponent(props.colUnit) }
    </Paper>
  )
}