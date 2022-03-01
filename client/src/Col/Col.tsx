import { Box, Paper, } from '@mui/material';
import { Col, ColState } from '../types/Col';
import Login from '../Auth/Login';
import Register from '../Auth/Register';
import User from '../User/User';
import Jam from '../Jam/Jam';
import Map from '../Map/Map';
import Search from '../Search/Search';
import React, { useEffect } from 'react';
import { colVar, paletteVar, sizeVar } from '../cache';
import { useReactiveVar } from '@apollo/client';
import { useLocation, useNavigate } from 'react-router-dom';
import { getColor, getColWidth } from '../utils';
import ColBar from './ColBar';
import NotFound from '../NotFound';
import PostCol from '../Post/PostCol';
import useChangeCol from './useChangeCol';

interface ColComponentProps {
  colState: ColState;
}
export default function ColComponent(props: ColComponentProps) {
  const location = useLocation();

  const navigate = useNavigate();
  const colDetail = useReactiveVar(colVar);
  const sizeDetail = useReactiveVar(sizeVar);
  const paletteDetail = useReactiveVar(paletteVar);

  const { changeCol: changeColBack } = useChangeCol(-1);
  const { changeCol: changeColForward } = useChangeCol(1);

  useEffect(() => {
    const sliceId = props.colState.stack[props.colState.index].id
    if (location.state) {
      if ((location.state as any).id === sliceId) {
        if (colDetail.i !== props.colState.col.i) {
          colVar({
            ...colDetail,
            i: props.colState.col.i,
          })
        }
      }
      else {
        const prevSliceId = props.colState.stack[props.colState.index - 1]?.id;
        if (prevSliceId && (location.state as any).id === prevSliceId) {
          const prevPathname = props.colState.stack[props.colState.index - 1].pathname
          changeColBack(props.colState.col, prevPathname);
        }
        else { 
          const nextSliceId = props.colState.stack[props.colState.index + 1]?.id;
          if (nextSliceId && (location.state as any).id === nextSliceId) {
            const nextPathname = props.colState.stack[props.colState.index + 1].pathname
            changeColBack(props.colState.col, nextPathname);
          }
        }
      }
    }

  }, [location, props.colState])

  const handleClick = (event: React.MouseEvent) => {
    colVar({
      ...colDetail,
      isAdding: false,
      i: props.colState.col.i,
    });
    let id = '';
    colDetail.colStates.some(colState => {
      if (colState.col.id === props.colState.col.id) {
        id = colState.stack[colState.index].id;
        return true;
      }
      return false;
    })
    navigate(props.colState.col.pathname, {
      state: {
        id,
      }
    });
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
    else if (path[1] === 'p') {
      return (
        <PostCol
          col={col}
          id={path[2]}
        />
      )
    }
    else {
      return (
        <Box>
          <ColBar col={props.colState.col} />
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
      backgroundColor: colDetail.i === props.colState.col.i
        ? paletteDetail.mode === 'dark'
          ? 'black'
          : 'azure'
        : 'none',
    }}>
      { mapColToComponent(props.colState.col) }
    </Paper>
  )
}