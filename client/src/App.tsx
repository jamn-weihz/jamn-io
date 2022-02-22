import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import Appbar from './Appbar';
import { gql, useLazyQuery, useReactiveVar } from '@apollo/client';
import { USER_FIELDS } from './fragments';
import { sizeVar, tokenVar, userVar } from './cache';
import { Box } from '@mui/material'; 
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
import { ALGOLIA_APP_ID, ALGOLIA_APP_KEY, ALGOLIA_INDEX_NAME, APPBAR_HEIGHT, DEFAULT_COLOR } from './constants';
import { InstantSearch } from 'react-instantsearch-dom';
import algoliasearch from 'algoliasearch/lite';

const GET_USER = gql`
  query GetUser {
    getUser {
      ...UserFields
    }
  }
  ${USER_FIELDS}
`;

function App() {
  const tokenDetail = useReactiveVar(tokenVar);
  const userDetail = useReactiveVar(userVar);
  const sizeDetail = useReactiveVar(sizeVar);

  const { refreshToken, refreshTokenInterval } = useToken();

  const [searchClient, setSearchClient] = useState(null as any | null);

  useEffect(() => {
    setSearchClient(algoliasearch(ALGOLIA_APP_ID, ALGOLIA_APP_KEY));
  }, []);

  const [getUser] = useLazyQuery(GET_USER, {
    onError: error => {
      console.error(error)
    },
    onCompleted: data => {
      console.log(data);
      if (data.getUser.id) {
        refreshTokenInterval();
        userVar({
          user: data.getUser,
        });
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

  const appbarHeight = 48;


  const theme = createTheme({
    palette: {
      primary: {
        main: userDetail.user?.color || DEFAULT_COLOR,
      },
      secondary: {
        main: grey[600],
      }
    }
  });

  const app = (
    <Box sx={{
      width: '100%',
      height: '100%',
    }}>
    <ThemeProvider theme={theme}> 
      <Appbar />
      <Box sx={{height: APPBAR_HEIGHT}}/>
      <Box sx={{
        position: 'relative',
        height: sizeDetail.height - APPBAR_HEIGHT, 
        width: '100%'
      }}>
        <Routes>
          <Route path='/' element={<Map />} />
          <Route path='/about' element={null} />
          <Route path='/support' element={null} />
          <Route path='/register' element={<Register />} />
          <Route path='/login' element={<Login />} />
          <Route path='/u/:userName' element={<User />}>
            <Route path='j' element={<User />} />
            <Route path='p' element={<User />} />
            <Route path='v' element={<User />} />
            <Route path='s' element={<User />} />
          </Route>
          <Route path='/j/:jamName' element={<Jam />}>
            <Route path='u' element={<Jam />} />
            <Route path='p' element={<Jam />} />
            <Route path='s' element={<Jam />} />
          </Route>
          <Route path='/p/:postId' element={null} />
          <Route path='/l/:linkId' element={null} />
          <Route path='/v/:voteId' element={null} />
          <Route path='*' element={<NotFound />} />
        </Routes>
      </Box>
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
