import React, { useEffect, useState } from 'react';
import './App.css';
import Appbar from './Appbar';
import { gql, useApolloClient, useLazyQuery, useReactiveVar } from '@apollo/client';
import { FULL_USER_FIELDS } from './fragments';
import { colVar, sizeVar, tokenVar, userVar } from './cache';
import { Box, Card, Drawer, IconButton, Theme } from '@mui/material'; 
import { Route, Routes } from 'react-router-dom';
import Login from './Auth/Login';
import Register from './Auth/Register';
import NotFound from './NotFound';
import User from './User/User';
import Jam from './Jam/Jam';
import useToken from './Auth/useToken';
import Map from './Map/Map';
import { ThemeProvider, createTheme } from '@mui/material';
import { grey } from '@mui/material/colors';
import { ALGOLIA_APP_ID, ALGOLIA_APP_KEY, ALGOLIA_INDEX_NAME, DEFAULT_COLOR } from './constants';
import { InstantSearch } from 'react-instantsearch-dom';
import algoliasearch, { SearchClient } from 'algoliasearch/lite';
import { Col } from './types/Col';
import Search from './Search';
import ColAdder from './Col/ColAdder';

const GET_USER = gql`
  query GetUser {
    getUser {
      ...FullUserFields
    }
  }
  ${FULL_USER_FIELDS}
`;

function App() {
  const client = useApolloClient();
  const tokenDetail = useReactiveVar(tokenVar);
  const userDetail = useReactiveVar(userVar);
  const colDetail = useReactiveVar(colVar);

  const { refreshToken, refreshTokenInterval } = useToken();

  const [searchClient, setSearchClient] = useState(null as SearchClient | null);
  const [theme, setTheme] = useState(null as Theme | null);
  
  useEffect(() => {
    setSearchClient(algoliasearch(ALGOLIA_APP_ID, ALGOLIA_APP_KEY));
  }, []);

  useEffect(() => {
    setTheme(createTheme({
      palette: {
        primary: {
          main: userDetail?.color || DEFAULT_COLOR,
        },
        secondary: {
          main: grey[600],
        }
      }
    }));
  }, [userDetail?.color])

  const [getUser] = useLazyQuery(GET_USER, {
    onError: error => {
      console.error(error)
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
    if (tokenDetail.isValid) {
      getUser();
    }
  }, [tokenDetail.isValid])

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

  if (!theme) return null;

  const mapColToComponent = (col: Col, i: number) => {
    const path = col.pathname.split('/');
    if (path[1] === 'register') {
      return <Register key={'col-'+i} i={i}/>
    }
    else if (path[1] === 'login') {
      return <Login key={'col-'+i} i={i}/>
    }
    else if (path[1] === 'map') {
      return <Map key={'col'+i} i={1}/>
    }
    else if (path[1] === 'search') {
      return <Search key={'col-'+i} i={i} />
    }
    else if (path[1] === 'u') {
      return <User key={'col-'+i} i={i} name={path[2]}/>
    }
    else if (path[1] === 'j') {
      return <Jam key={'col-'+i} i={i} name={path[2]}/>
    }
  }

  const app = (
    <Box sx={{
      position: 'fixed',
      left: 0,
      top: 0,
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'row',
      overflow: 'scroll',
    }}>
      <ThemeProvider theme={theme}>
        <Appbar />
        <Box sx={{
          display: 'flex',
          flexDirection: 'row',
        }}>
          <Box sx={{width: 52,}}/>
          {
            colDetail.cols.map(mapColToComponent)
          }
        </Box>
        <ColAdder />
      </ThemeProvider>
    </Box>
  );
  if (!searchClient) return app;
  return (
    <InstantSearch searchClient={searchClient} indexName={ALGOLIA_INDEX_NAME}>
      { app }
    </InstantSearch>
  );
}

export default App;
