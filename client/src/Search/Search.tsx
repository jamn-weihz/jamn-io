import Surveyor from '../Surveyor/Surveyor';
import React, { Dispatch, useEffect, useState } from 'react';
import { Box, Card, IconButton } from '@mui/material';
import { Col } from '../types/Col';
import ColRemovalButton from '../Col/ColRemovalButton';
import { SurveyorSlice, SurveyorState } from '../types/Surveyor';
import { surveyorVar } from '../cache';
import { useReactiveVar } from '@apollo/client';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { InstantSearch } from 'react-instantsearch-dom';
import algoliasearch, { SearchClient } from 'algoliasearch/lite';
import { ALGOLIA_APP_ID, ALGOLIA_APP_KEY, ALGOLIA_INDEX_NAME } from '../constants';
import SearchBox from './SearchBox';
import Hits from './Hits';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { PostAction } from '../types/Post';

interface SearchProps {
  col: Col;
  postDispatch: Dispatch<PostAction>;
}
export default function Search(props: SearchProps) {
  const surveyorDetail = useReactiveVar(surveyorVar);

  const [showOptions, setShowOptions] = useState(false);

  const [searchClient, setSearchClient] = useState(null as SearchClient | null);
  useEffect(() => {
    setSearchClient(algoliasearch(ALGOLIA_APP_ID, ALGOLIA_APP_KEY));
  }, []);

  useEffect(() => {
    const surveyorState = surveyorDetail[props.col.id];
    if (surveyorState) return;

    const surveyorSlice: SurveyorSlice = {
      originalQuery: '',
      query: '',
      items: [],
    };
    const surveyorState1: SurveyorState = {
      index: 0,
      stack: [surveyorSlice],
      scrollToTop: false,
      reload: false,
      triggerRefinement: false,
    };
    surveyorVar({
      ...surveyorDetail,
      [props.col.id]: surveyorState1,
    });
  });

  const handleOptionsClick = (event: React.MouseEvent) => {
    setShowOptions(!showOptions);
  };

  const handleBackClick = (event: React.MouseEvent) => {
    const surveyorState = surveyorDetail[props.col.id];
    const stack = surveyorState.stack.slice();
    const query = surveyorState.stack[surveyorState.index - 1].originalQuery;
    stack.splice(surveyorState.index - 1, 1, {
      ...surveyorState.stack[surveyorState.index - 1],
      query,
    })
    surveyorVar({
      ...surveyorDetail,
      [props.col.id]: {
        ...surveyorState,
        scrollToTop: true,
        index: surveyorState.index - 1,
        stack,
      }
    });
  };

  const handleForwardClick = (event: React.MouseEvent) => {
    const surveyorState = surveyorDetail[props.col.id];
    const stack = surveyorState.stack.slice();
    const query = surveyorState.stack[surveyorState.index + 1].originalQuery
    stack.splice(surveyorState.index + 1, 1, {
      ...surveyorState.stack[surveyorState.index + 1],
      query,
    })
    surveyorVar({
      ...surveyorDetail,
      [props.col.id]: {
        ...surveyorState,
        stack,
        scrollToTop: true,
        index: surveyorState.index + 1,
      },
    });
  };

  const surveyorState = surveyorDetail[props.col.id];
  
  if (!surveyorState) return null;

  return (
    <Box sx={{
      height: '100%'
    }}>
      <Card elevation={5} sx={{
        color: 'dimgrey',
      }}>
        <Box sx={{
          padding: 1,
          display: 'flex',
          justifyContent: 'space-between',
        }}>
        <Box>
            /search
          </Box>
          <IconButton size='small' onClick={handleOptionsClick} sx={{
              fontSize: 20,
              padding: 0,
            }}>
              <MoreVertIcon fontSize='inherit'/> 
            </IconButton>
        </Box>
        <Box sx={{
          display: showOptions ? 'flex' : 'none',
          padding: 1,
          borderTop: '1px solid lavender',
        }}>
          <ColRemovalButton col={props.col} />
        </Box>
      </Card>
          {
            searchClient
              ? <InstantSearch searchClient={searchClient} indexName={ALGOLIA_INDEX_NAME}>
                  <Card elevation={5} sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    margin: 1,
                    padding: 1,
                    marginBottom: 0,
                    borderBottom: '1px solid grey',
                  }}>
                    <Box sx={{ whiteSpace: 'nowrap', paddingRight: 1,}}>
                      <IconButton
                        disabled={surveyorState.index <= 0} 
                        size='small'
                        onClick={handleBackClick}
                      >
                        <ArrowBackIcon fontSize='inherit' />
                      </IconButton>
                      <IconButton
                        disabled={surveyorState.index >= surveyorState.stack.length - 1} 
                        size='small'
                        onClick={handleForwardClick}
                      >
                        <ArrowForwardIcon fontSize='inherit' />
                      </IconButton> 
                    </Box>
                    <Box> 
                      <SearchBox col={props.col} defaultRefinement='JAMN.IO' />
                      <Hits col={props.col} />
                    </Box>
                  </Card>
                  <Box sx={{
                    height: '100%',
                    overflow: 'scroll',
                  }}>
                    <Surveyor 
                      key={`surveyor-${props.col.id}`} 
                      col={props.col}
                      postDispatch={props.postDispatch}
                    />
                   </Box>
                </InstantSearch>
              : null
          }
    </Box>
  )
}