import React, { Dispatch, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react';
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
import { ItemAction, ItemState } from './types/Item';
import reduceAddPrev from './Surveyor/reduceAddPrev';
import reduceAddNext from './Surveyor/reduceAddNext';
import reduceAddLink from './Surveyor/reduceAddLink';
import reduceRemoveLink from './Surveyor/reduceRemoveLink';
import SnackBar from './Auth/SnackBar';
import { useLocation, useNavigate } from 'react-router-dom';
import useAddCol from './Col/useAddCol';
import { Col, ColAction, ColState, ColUnit } from './types/Col';
import reduceResetCols from './Col/reduceResetCols';
import reduceInitCols from './Col/reduceInitCols';
import reduceRemoveCol from './Col/reduceRemoveCol';
import reduceShiftCols from './Col/reduceShiftCols';
import useChangeCol from './Col/useChangeCol';
import { v4 as uuidv4 } from 'uuid';

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

export type ItemContextType = {
  state: ItemState;
  dispatch: Dispatch<ItemAction>;
};
export const ItemContext = React.createContext({} as ItemContextType);

export type PostContextType = {
  state: PostState;
  dispatch: Dispatch<PostAction>;
}
export const PostContext = React.createContext({} as PostContextType);

function App() {
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

  const colReducer = (state: ColState, action: ColAction) => {
    console.log(action);
    switch (action.type) {
      case 'RESET_COLS':
        return reduceResetCols(state, action);
      case 'INIT_COLS':
        return reduceInitCols(state, action);
      case 'ADD_COL':
        return {
          ...state,
          colUnits: [...state.colUnits, {
            col: action.col,
            stack: [{
              pathname: action.col.pathname,
              id: addColDetail.id || action.id,
            }],
            index: 0,
          } as ColUnit],
          i: state.colUnits.length,
          showAdder: false,
          navigate: addColDetail.id 
            ? false
            : action.navigate,
          scroll: true,
          addedCol: addColDetail.id
            ? action.col
            : null,
        };
      case 'REMOVE_COL':
        return reduceRemoveCol(state, action);
      case 'UPDATE_COL':
        const colUnits = state.colUnits.slice();
        colUnits.splice(action.colUnit.col.i, 1, action.colUnit);
        return {
          ...state,
          colUnits,
          navigate: action.navigate,
        };
      case 'SHIFT_COLS':
        return reduceShiftCols(state, action);
      case 'SELECT_COL':
        return {
          ...state,
          i: action.i,
          showAdder: false,
          scroll: action.scroll,
          navigate: action.navigate,
        };
      case 'SHOW_ADDER':
        return {
          ...state,
          showAdder: true,
        };
      case 'HIDE_ADDER':
        return {
          ...state,
          showAdder: false,
        };
      case 'TOGGLE_COL_OPTIONS':
        return {
          ...state,
          colUnits: state.colUnits.map(colUnit => {
            if (colUnit.col.id === action.col.id) {
              return {
                ...colUnit,
                showOptions: !colUnit.showOptions,
              };
            }
            return colUnit;
          }),
        };
      case 'SCROLL_COMPLETE':
        return {
          ...state,
          scroll: false,
        };
      case 'NAVIGATE_COMPLETE':
        return {
          ...state,
          navigate: false,
        }
      case 'CLEAR_ADDED_COL_COMPLETE':
        return {
          ...state,
          addedCol: null,
        };
      default:
        throw new Error('Invalid action type')
    }
  }
  const [colState, colDispatch] = useReducer(colReducer, {
    isInit: false,
    showAdder: false,
    colUnits: [],
    i: 0,
    scroll: false,
    navigate: false,
    addedCol: null,
  });

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
        console.log('hello')
      }
    }
  }, [tokenDetail.isInit, tokenDetail.isValid]);

  useEffect(() => {
    if (!colState.isInit) return;
  
    console.log(location)
    if (location.pathname === '/') {
      colDispatch({
        type: 'SELECT_COL',
        i: 0,
        scroll: true,
        navigate: false,
      });
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
      if ((location.state as any).id) {
        const { id, colId } = location.state as any;
        const found = colState.colUnits.some(colUnit => {
          if (colUnit.col.id === colId) {
            if (colUnit.stack[colUnit.index].id === id) {
              colDispatch({
                type: 'SELECT_COL',
                i: colUnit.col.i,
                scroll: true,
                navigate: false,
              });
            }
            else if (colUnit.stack[colUnit.index - 1]?.id === id) {
              changeColBack(colUnit.col);
            }
            else if (colUnit.stack[colUnit.index + 1]?.id === id) {
              changeColForward(colUnit.col);
            }
            else if (colUnit.stack[colUnit.index].pathname === pathname) {
              console.log('yolo')
              navigate(pathname, {
                state: {
                  id: colUnit.stack[colUnit.index].id,
                  colId,
                },
                replace: true,
              })
            }
            else {
              return false;
            }
            return true;
          }
          return false;
        });
        if (!found) {
          console.log('has state', id, colId);
          addColVar({
            id,
          })
          addCol(pathname);
        }
      }
      else {
        let col = null as Col | null; 
        colState.colUnits.some(colUnit => {
          if (colUnit.col.pathname === pathname) {
            col = colUnit.col;
            return true;
          }
          return false;
        });

        if (col) {
          console.log('selectme')
          colDispatch({
            type: 'SELECT_COL',
            i: col.i,
            scroll: true,
            navigate: false,
          });
        }
        else {
          console.log('no state')
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
    console.log(col);
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
    console.log(addColDetail);
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
    <ColContext.Provider value={{state: colState, dispatch: colDispatch}}>
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
    </ItemContext.Provider>
    </PostContext.Provider>
    </ColContext.Provider>
  );
}

export default App;
