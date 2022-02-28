import { Box, Paper, } from '@mui/material';
import { Col } from '../types/Col';
import Login from '../Auth/Login';
import Register from '../Auth/Register';
import User from '../User/User';
import Jam from '../Jam/Jam';
import Map from '../Map/Map';
import Search from '../Search/Search';
import React, { useState } from 'react';
import { colVar, paletteVar, sizeVar } from '../cache';
import { useReactiveVar } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { getColor, getColWidth } from '../utils';
import ColBar from './ColBar';
import NotFound from '../NotFound';

interface ColComponentProps {
  col: Col;
}
export default function ColComponent(props: ColComponentProps) {
  const navigate = useNavigate();
  const colDetail = useReactiveVar(colVar);
  const sizeDetail = useReactiveVar(sizeVar);
  const paletteDetail = useReactiveVar(paletteVar);

  const handleClick = (event: React.MouseEvent) => {
    colVar({
      ...colDetail,
      isAdding: false,
      i: props.col.i,
    });
    navigate(props.col.pathname);
  }
  const mapColToComponent = (col: Col) => {
    const path = col.pathname.split('/');
    if (path[1] === 'register') {
      return <Register col={col}/>;
    }
    else if (path[1] === 'login') {
      return <Login col={col}/>;
    }
    else if (path[1] === 'map') {
      return <Map col={col}/>;
    }
    else if (path[1] === 'search') {
      return (
        <Search 
          col={col} 
        />
      );
    }
    else if (path[1] === 'u') {
      return (
        <User 
          col={col} 
          name={path[2]} 
        />
      );
    }
    else if (path[1] === 'j') {
      return (
        <Jam 
          col={col} 
          name={path[2]} 
        />
      );
    }
    else {
      return (
        <Box>
          <ColBar col={props.col} />
          <NotFound />
        </Box>
      )
    }
  }

  return (
    <Paper onClick={handleClick} sx={{
      border: '1px solid',
      borderColor: getColor(paletteDetail.mode, true),
      minWidth: getColWidth(sizeDetail.width),
      width: getColWidth(sizeDetail.width),
      height: '100%',
      position: 'relative',
      backgroundColor: colDetail.i === props.col.i
        ? paletteDetail.mode === 'dark'
          ? 'black'
          : 'aliceblue'
        : 'none',
    }}>
      { mapColToComponent(props.col) }
    </Paper>
  )
}