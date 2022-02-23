import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import './App.css';
import Appbar from './Appbar';
import { gql, useLazyQuery, useReactiveVar } from '@apollo/client';
import { FULL_USER_FIELDS } from './fragments';
import { colVar, sizeVar, tokenVar, userVar } from './cache';
import { Box, Theme } from '@mui/material';
import useToken from './Auth/useToken';
import { ThemeProvider, createTheme } from '@mui/material';
import { grey } from '@mui/material/colors';
import {DEFAULT_COLOR } from './constants';
import ColAdder from './Col/ColAdder';
import ColComponent from './Col/Col';
import resetCols from './Col/resetCols';
import { getAppbarWidth } from './utils';
import { PostAction, PostState } from './types/Post';
import useSavePostSubcription from './Post/useSavePostSubcription';
import useLinkPostsSubcription from './Post/useLinkPostsSubscription';

const GET_USER = gql`
  query GetUser {
    getUser {
      ...FullUserFields
    }
  }
  ${FULL_USER_FIELDS}
`;


function App() {
  const tokenDetail = useReactiveVar(tokenVar);
  const userDetail = useReactiveVar(userVar);
  const colDetail = useReactiveVar(colVar);
  const sizeDetail = useReactiveVar(sizeVar);

  const containerEl = useRef<HTMLElement>();
  const { refreshToken, refreshTokenInterval } = useToken();

  const [theme, setTheme] = useState(null as Theme | null);

  useEffect(() => {
    setTheme(createTheme({
      palette: {
        primary: {
          main: userDetail?.color || DEFAULT_COLOR,
        },
        secondary: {
          main: grey[600],
        }
      },
    }));
  }, [userDetail?.color])

  const [getUser] = useLazyQuery(GET_USER, {
    onError: error => {
      console.error(error);
    },
    onCompleted: data => {
      console.log(data);
      if (data.getUser.id) {
        refreshTokenInterval();
        userVar(data.getUser);
        colVar({
          ...colDetail,
          cols: data.getUser.cols,
        })
      }
    }
  });

  useEffect(() => {
    refreshToken();
  }, []);

  useEffect(() => {
    if (tokenDetail.isInit) {
      if (tokenDetail.isValid) {
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

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const postReducer = (state: PostState, action: PostAction) => {
    switch (action.type) {
      case 'ADD':
        return {
          ...state,
          [action.postId]: [
            ...(state[action.postId] || []),
            action.postKey,
          ],
        }
      case 'REMOVE':
        return {
          ...state,
          [action.postId]: (state[action.postId] || [])
            .filter(postKey => postKey !== action.postKey),
        }
      default:
        throw new Error('Invalid action type')
    }
  }
  const [postState, postDispatch] = useReducer(postReducer, {});

  const postIds = useMemo(() => Object.keys(postState), [postState]);

  useSavePostSubcription(postIds);
  useLinkPostsSubcription(postIds);

  if (!theme) return null;

  return (
    <ThemeProvider theme={theme}>
    <Box sx={{
      width: '100%',
      height: '100%',
    }}>
        <Appbar  containerEl={containerEl} />
        <Box sx={{
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
          }}>
            {
              userDetail?.id
                ? userDetail.cols
                    .filter(col => !col.deleteDate)
                    .sort((a, b) => a.i < b.i ? -1 : 1)
                    .map(col => {
                      return (
                        <ColComponent 
                          key={`col-${col.i}`}
                          col={col} 
                          postDispatch={postDispatch}
                        />
                      );
                    })
                : colDetail.cols.map(col => {
                    return (
                      <ColComponent 
                        key={`col-${col.i}`}
                        col={col} 
                        postDispatch={postDispatch}
                      />
                    );
                  })
            }
          </Box>
        </Box>
        <ColAdder containerEl={containerEl}/>
      </Box>
    </ThemeProvider>
  )
}

export default App;
