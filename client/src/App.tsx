import React, { Dispatch, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import './App.css';
import AppBar from './AppBar';
import { gql, useLazyQuery, useReactiveVar } from '@apollo/client';
import { FULL_USER_FIELDS } from './fragments';
import { colVar, paletteVar, sizeVar, tokenVar, userVar } from './cache';
import { Box, Paper, Theme } from '@mui/material';
import useToken from './Auth/useToken';
import { ThemeProvider, createTheme } from '@mui/material';
import { grey } from '@mui/material/colors';
import {DEFAULT_COLOR } from './constants';
import ColAdder from './Col/ColAdder';
import ColComponent from './Col/Col';
import resetCols from './Col/resetCols';
import { getAppbarWidth, getColWidth } from './utils';
import { PostAction, PostState } from './types/Post';
import useSavePostSubcription from './Post/useSavePostSubcription';
import useLinkPostsSubcription from './Post/useLinkPostsSubscription';
import { ItemAction, ItemState } from './types/Item';
import reduceAddPrev from './Surveyor/reduceAddPrev';
import reduceAddNext from './Surveyor/reduceAddNext';
import reduceAddLink from './Surveyor/reduceAddLink';
import reduceRemoveLink from './Surveyor/reduceRemoveLink';
import SnackBar from './Auth/SnackBar';
import { Col, ColState } from './types/Col';
import mapColsToColStates from './Col/mapColsToColStates';

const GET_USER = gql`
  query GetUser {
    getUser {
      ...FullUserFields
    }
  }
  ${FULL_USER_FIELDS}
`;

type ItemContextType = {
  state: ItemState;
  dispatch: Dispatch<ItemAction>;
};
export const ItemContext = React.createContext({} as ItemContextType);

type PostContextType = {
  state: PostState;
  dispatch: Dispatch<PostAction>;
}
export const PostContext = React.createContext({} as PostContextType);

function App() {
  const tokenDetail = useReactiveVar(tokenVar);
  const userDetail = useReactiveVar(userVar);
  const colDetail = useReactiveVar(colVar);
  const sizeDetail = useReactiveVar(sizeVar);
  const paletteDetail = useReactiveVar(paletteVar);
  const containerEl = useRef<HTMLElement>();
  const { refreshToken, refreshTokenInterval } = useToken();

  const [theme, setTheme] = useState(null as Theme | null);
  
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setTheme(createTheme({
      palette: {
        primary: {
          main: userDetail?.color || DEFAULT_COLOR,
        },
        secondary: {
          main: grey[600],
        },
        mode: paletteDetail.mode,
      },
    }));
  }, [userDetail?.color, paletteDetail.mode])

  const [getUser] = useLazyQuery(GET_USER, {
    onError: error => {
      console.error(error);
    },
    onCompleted: data => {
      if (isLoading) {
        console.log(data);
        if (data.getUser.id) {
          refreshTokenInterval();
          userVar(data.getUser);
          colVar({
            ...colDetail,
            colStates: mapColsToColStates(data.getUser.cols),
          });
          setIsLoading(false);
        }
      }
    }
  });

  useEffect(() => {
    refreshToken();
  }, []);

  useEffect(() => {
    if (tokenDetail.isInit) {
      if (tokenDetail.isValid) {
        setIsLoading(true);
        getUser();
      }
      else {
        resetCols();
      }
    }
  }, [tokenDetail.isInit, tokenDetail.isValid])

  useEffect(() => {
    const handleResize = () => {
      sizeVar({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);

    const handlePaletteModeChange =  (event: any) => {
      paletteVar({
        mode: event.matches ? 'dark' : 'light'
      });
    }

    window.matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', handlePaletteModeChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.matchMedia('(prefers-color-scheme: dark)')
        .removeEventListener('change', handlePaletteModeChange)
    }
  }, []);

  useEffect(() => {
    if (colDetail.scroll) {
      colVar({
        ...colDetail,
        scroll: false,
      });
      containerEl.current?.scrollTo({
        left: colDetail.i * getColWidth(sizeDetail.width),
        behavior: 'smooth',
      })
    }
  }, [colDetail.scroll])

  const postReducer = (state: PostState, action: PostAction) => {
    switch (action.type) {
      case 'ADD':
        return {
          ...state,
          [action.postId]: [
            ...(state[action.postId] || []),
            action.itemId,
          ],
        }
      case 'REMOVE':
        return {
          ...state,
          [action.postId]: (state[action.postId] || [])
            .filter(itemId => itemId !== action.itemId),
        }
      default:
        throw new Error('Invalid action type')
    }
  }
  const [postState, postDispatch] = useReducer(postReducer, {});

  const postIds = useMemo(() => Object.keys(postState), [postState]);

  const itemReducer = (state: ItemState, action: ItemAction) => {
    console.log(action);
    switch (action.type) {
      case 'ADD_ITEMS':
        return {
          ...state,
          ...action.idToItem,
        };
      case 'UPDATE_ITEM': 
        return {
          ...state,
          [action.item.id]: action.item,
        };
      case 'ADD_PREV':
        return reduceAddPrev(state, action);
      case 'ADD_NEXT':
        return reduceAddNext(state, action);
      case 'ADD_LINK':
        return reduceAddLink(state, action);
      case 'REMOVE_LINK':
        return reduceRemoveLink(state, action);
      default:
        throw new Error('Invalid action type');
    }
  };

  const [itemState, itemDispatch] = useReducer(itemReducer, {});

  useSavePostSubcription(postIds);
  useLinkPostsSubcription(postIds, itemDispatch);
  
  if (!theme) return null;

  return (
    <PostContext.Provider value={{state: postState, dispatch: postDispatch}}>
    <ItemContext.Provider value={{state: itemState, dispatch: itemDispatch}}>
      <ThemeProvider theme={theme}>
        <Paper sx={{
          position: 'relative',
          width: '100%',
          height: '100%',
        }}>
          <AppBar containerEl={containerEl} />
          <Paper sx={{
            position: 'fixed',
            left: getAppbarWidth(sizeDetail.width),
            top: 0,
            bottom: 0,
            rigth: 0,
          }}>
            <Box ref={containerEl}  sx={{
              display: 'flex',
              flexDirection: 'row',
              overflowY: 'hidden',
              overflowX: 'scroll',
              height: '100%',
              width: sizeDetail.width - getAppbarWidth(sizeDetail.width),
              backgroundColor: 'inherit',
            }}>
              {
                colDetail.colStates.map(colState => {
                  return (
                    <ColComponent 
                      key={`col-${colState.col.id}`}
                      col={colState.col} 
                    />
                  );
                })
              }
            </Box>
          </Paper>
          <ColAdder containerEl={containerEl}/>
          <SnackBar />
        </Paper>
      </ThemeProvider>
    </ItemContext.Provider>
    </PostContext.Provider>
  );
}

export default App;
