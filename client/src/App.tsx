import React, { Dispatch, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import './App.css';
import AppBar from './AppBar';
import { gql, useLazyQuery, useReactiveVar } from '@apollo/client';
import { FULL_USER_FIELDS } from './fragments';
import { addColVar, paletteVar, sizeVar, tokenVar, userVar } from './cache';
import { Box, Paper, Theme } from '@mui/material';
import useToken from './Auth/useToken';
import { ThemeProvider, createTheme } from '@mui/material';
import { grey } from '@mui/material/colors';
import {DEFAULT_COLOR } from './constants';
import ColAdder from './Col/ColAdder';
import ColComponent from './Col/Col';
import { getAppbarWidth, getColWidth } from './utils';
import { PostAction, PostState } from './types/Post';
import useSavePostSubcription from './Post/useSavePostSubcription';
import useLinkPostsSubcription from './Post/useLinkPostsSubscription';
import { CardAction, CardState } from './types/Card';
import reduceAddPrev from './Card/reduceAddPrev';
import reduceAddNext from './Card/reduceAddNext';
import reduceAddLink from './Card/reduceAddLink';
import reduceRemoveLink from './Card/reduceRemoveLink';
import SnackBar from './Auth/SnackBar';
import { useLocation, useNavigate } from 'react-router-dom';
import useAddCol from './Col/useAddCol';
import { ColAction, ColState, ColUnit } from './types/Col';
import useChangeCol from './Col/useChangeCol';
import { v4 as uuidv4 } from 'uuid';
import useColStore from './Col/useColStore';
import { RestartableClient } from '.';

const GET_USER = gql`
  query GetUser {
    getUser {
      ...FullUserFields
    }
  }
  ${FULL_USER_FIELDS}
`;

export type ColContextType = {
  state: ColState;
  dispatch: Dispatch<ColAction>
};
export const ColContext = React.createContext({} as ColContextType);

export type CardContextType = {
  state: CardState;
  dispatch: Dispatch<CardAction>;
};
export const CardContext = React.createContext({} as CardContextType);

export type PostContextType = {
  state: PostState;
  dispatch: Dispatch<PostAction>;
}
export const PostContext = React.createContext({} as PostContextType);

interface AppProps {
  wsClient: RestartableClient;
}
function App(props: AppProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const tokenDetail = useReactiveVar(tokenVar);
  const userDetail = useReactiveVar(userVar);
  const sizeDetail = useReactiveVar(sizeVar);
  const paletteDetail = useReactiveVar(paletteVar);
  const addColDetail = useReactiveVar(addColVar);

  const containerEl = useRef<HTMLElement>();

  const { refreshToken, refreshTokenInterval } = useToken();

  const [theme, setTheme] = useState(null as Theme | null);
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    props.wsClient.restart();
  }, [userDetail?.id]);
  
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

  useEffect(() => {
    refreshToken();

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

  const [colState, colDispatch] = useColStore();

  const { addCol } = useAddCol({
    state: colState,
    dispatch: colDispatch,
  });

  const { changeCol: changeColBack } = useChangeCol(-1, false, {
    state: colState,
    dispatch: colDispatch,
  });
  const { changeCol: changeColForward } = useChangeCol(1, false, {
    state: colState,
    dispatch: colDispatch,
  })

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
          colDispatch({
            type: 'INIT_COLS',
            cols: data.getUser.cols,
          });
          setIsLoading(false);
        }
      }
    }
  });

  useEffect(() => {
    if (tokenDetail.isInit) {
      if (tokenDetail.isValid) {
        getUser();
      }
      else {
        colDispatch({
          type: 'RESET_COLS',
        });
        setIsLoading(false);
      }
    }
  }, [tokenDetail.isInit, tokenDetail.isValid]);

  useEffect(() => {
    if (!colState.isInit) return;

    if (location.pathname === '/') {
      if (colState.colUnits.length) {
        navigate(colState.colUnits[0].col.pathname, {
          state: {
            id: colState.colUnits[0].stack[colState.colUnits[0].index].id,
            colId: colState.colUnits[0].col.id,
          },
          replace: true,
        })
      }
    }
    else {
      const pathname = decodeURIComponent(location.pathname);
      if ((location.state as any)?.id) {
        const { id, colId } = location.state as any;
        const foundCol = colState.colUnits.some(colUnit => {
          if (colUnit.col.id === colId) {
            if (colUnit.stack[colUnit.index].id === id) {
              if (colState.i !== colUnit.col.i) {
                colDispatch({
                  type: 'SELECT_COL',
                  i: colUnit.col.i,
                  scroll: true,
                  navigate: false,
                });
              }
              return true;
            }
            else if (colUnit.stack[colUnit.index - 1]?.id === id) {
              changeColBack(colUnit.col);
              return true;
            }
            else if (colUnit.stack[colUnit.index + 1]?.id === id) {
              changeColForward(colUnit.col);
              return true;
            }
            else if (colUnit.stack[colUnit.index].pathname === pathname) {
              navigate(pathname, {
                state: {
                  id: colUnit.stack[colUnit.index].id,
                  colId,
                },
                replace: true,
              })
              return true;
            }
          }
          return false;
        });
        if (!foundCol) {
          let colUnit = null as ColUnit | null; 
          colState.colUnits.some(colUnit_i => {
            if (colUnit_i.col.pathname === pathname) {
              colUnit = colUnit_i;
              return true;
            }
            return false;
          });

          if (colUnit) {
            navigate(colUnit.col.pathname, {
              state: {
                id: colUnit.stack[colUnit.index].id,
                colId: colUnit.col.id,
              },
              replace: true,
            });
          }
          else {
            addColVar({
              id: uuidv4(),
            })
            addCol(pathname);
          }
        }
      }
      else {
        let colUnit = null as ColUnit | null; 
        colState.colUnits.some(colUnit_i => {
          if (colUnit_i.col.pathname === pathname) {
            colUnit = colUnit_i;
            return true;
          }
          return false;
        });

        if (colUnit) {
          navigate(colUnit.col.pathname, {
            state: {
              id: colUnit.stack[colUnit.index].id,
              colId: colUnit.col.id,
            },
            replace: true,
          })
        }
        else {
          addColVar({
            id: uuidv4(),
          })
          addCol(pathname);
        }
      }
    }
  }, [location, colState.isInit]);

  useEffect(() => {
    if (!colState.navigate) return;
    const col = colState.colUnits[colState.i]?.col;
    navigate(col?.pathname || '/', {
      state: {
        id: uuidv4(),
        colId: col?.id || '',
      }
    });
    colDispatch({
      type: 'NAVIGATE_COMPLETE',
    });
  }, [colState.navigate])

  useEffect(() => {
    if (!colState.scroll) return;
    containerEl.current?.scrollTo({
      left: colState.i * getColWidth(sizeDetail.width),
      behavior: 'smooth',
    });
    colDispatch({
      type: 'SCROLL_COMPLETE',
    })
  }, [colState.scroll]);

  useEffect(() => {
    if (!colState.addedCol) return;
    navigate(colState.addedCol.pathname,  {
      state: {
        id: addColDetail.id,
        colId: colState.addedCol.id,
      },
      replace: true,
    });
    addColVar({
      id: '',
    });
    colDispatch({
      type: 'CLEAR_ADDED_COL_COMPLETE'
    })
  }, [colState.addedCol])

  const postReducer = (state: PostState, action: PostAction) => {
    switch (action.type) {
      case 'ADD':
        return {
          ...state,
          [action.postId]: [
            ...(state[action.postId] || []),
            action.cardId,
          ],
        }
      case 'REMOVE':
        return {
          ...state,
          [action.postId]: (state[action.postId] || [])
            .filter(cardId => cardId !== action.cardId),
        }
      default:
        throw new Error('Invalid action type')
    }
  }
  const [postState, postDispatch] = useReducer(postReducer, {});

  const postIds = useMemo(() => Object.keys(postState), [postState]);

  const cardReducer = (state: CardState, action: CardAction) => {
    console.log(action);
    switch (action.type) {
      case 'MERGE_ITEMS':
        return {
          ...state,
          ...action.idToCard,
        };
      case 'UPDATE_ITEM': 
        return {
          ...state,
          [action.card.id]: action.card,
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

  const [cardState, cardDispatch] = useReducer(cardReducer, {});


  //const [userState, userDisptach] = useReducer(userReducer, {})

  useSavePostSubcription(postIds, {
    state: postState,
    dispatch: postDispatch,
  }, {
    state: cardState,
    dispatch: cardDispatch,
  });
  useLinkPostsSubcription(postIds, cardDispatch);
  
  if (!theme) return null;

  return (
    <ColContext.Provider value={{state: colState, dispatch: colDispatch}}>
    <PostContext.Provider value={{state: postState, dispatch: postDispatch}}>
    <CardContext.Provider value={{state: cardState, dispatch: cardDispatch}}>
      <ThemeProvider theme={theme}>
        <Paper sx={{
          position: 'relative',
          width: '100%',
          height: '100%',
        }}>
          <AppBar />
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
                colState.colUnits.map(colUnit => {
                  return (
                    <ColComponent 
                      key={`col-${colUnit.col.id}`}
                      colUnit={colUnit}
                    />
                  );
                })
              }
            </Box>
          </Paper>
          <ColAdder />
          <SnackBar />
        </Paper>
      </ThemeProvider>
    </CardContext.Provider>
    </PostContext.Provider>
    </ColContext.Provider>
  );
}

export default App;