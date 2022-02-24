import Surveyor from '../Surveyor/Surveyor';
import React, { Dispatch, useEffect, useState } from 'react';
import { Box, Card, IconButton } from '@mui/material';
import { Col } from '../types/Col';
import RemoveColButton from '../Col/RemoveColButton';
import { SurveyorSlice, SurveyorState } from '../types/Surveyor';
import { paletteVar } from '../cache';
import { ReactiveVar, useReactiveVar } from '@apollo/client';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { InstantSearch } from 'react-instantsearch-dom';
import algoliasearch, { SearchClient } from 'algoliasearch/lite';
import { ALGOLIA_APP_ID, ALGOLIA_APP_KEY, ALGOLIA_INDEX_NAME } from '../constants';
import SearchBox from './SearchBox';
import Hits from './Hits';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { PostAction } from '../types/Post';
import { getColor } from '../utils';

interface SearchProps {
  col: Col;
  postDispatch: Dispatch<PostAction>;
}
export default function Search(props: SearchProps) {
  const paletteDetail = useReactiveVar(paletteVar);
  const [showOptions, setShowOptions] = useState(false);

  const [searchClient, setSearchClient] = useState(null as SearchClient | null);
  useEffect(() => {
    setSearchClient(algoliasearch(ALGOLIA_APP_ID, ALGOLIA_APP_KEY));
  }, []);

  const [surveyorState, setSurveyorState] = useState(() => {
    const surveyorSlice: SurveyorSlice = {
      originalQuery: '',
      query: '',
      itemIds: [],
    };
    const surveyorState: SurveyorState = {
      index: 0,
      stack: [surveyorSlice],
      scrollToTop: false,
      reload: false,
      triggerRefinement: false,
    };
    return surveyorState;
  });

  const handleOptionsClick = (event: React.MouseEvent) => {
    setShowOptions(!showOptions);
  };

  const handleBackClick = (event: React.MouseEvent) => {
    const stack = surveyorState.stack.slice();
    const query = surveyorState.stack[surveyorState.index - 1].originalQuery;
    stack.splice(surveyorState.index - 1, 1, {
      ...surveyorState.stack[surveyorState.index - 1],
      query,
    })
    setSurveyorState({
      ...surveyorState,
      scrollToTop: true,
      index: surveyorState.index - 1,
      stack,
    });
  };

  const handleForwardClick = (event: React.MouseEvent) => {
    const stack = surveyorState.stack.slice();
    const query = surveyorState.stack[surveyorState.index + 1].originalQuery
    stack.splice(surveyorState.index + 1, 1, {
      ...surveyorState.stack[surveyorState.index + 1],
      query,
    })
    setSurveyorState({
      ...surveyorState,
      stack,
      scrollToTop: true,
      index: surveyorState.index + 1,
    });
  };

  if (!surveyorState) return null;

  const color = getColor(paletteDetail.mode)
  return (
    <Box sx={{
      height: '100%',
    }}>
      <Card elevation={5}>
        <Box sx={{
          padding: 1,
          display: 'flex',
          justifyContent: 'space-between',
          color,
        }}>
        <Box>
            /search
          </Box>
          <IconButton size='small' onClick={handleOptionsClick} sx={{
              fontSize: 20,
              padding: 0,
              color,
            }}>
              <MoreVertIcon fontSize='inherit'/> 
            </IconButton>
        </Box>
        <Box sx={{
          display: showOptions ? 'flex' : 'none',
          padding: 1,
          borderTop: '1px solid',
          borderColor: getColor(paletteDetail.mode, true),
        }}>
          <RemoveColButton col={props.col} />
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
                    color,
                  }}>
                    <Box sx={{ whiteSpace: 'nowrap', paddingRight: 1,}}>
                      <IconButton
                        disabled={surveyorState.index <= 0} 
                        size='small'
                        color='inherit'
                        onClick={handleBackClick}
                      >
                        <ArrowBackIcon fontSize='inherit' />
                      </IconButton>
                      <IconButton
                        disabled={surveyorState.index >= surveyorState.stack.length - 1} 
                        size='small'
                        color='inherit'
                        onClick={handleForwardClick}
                      >
                        <ArrowForwardIcon fontSize='inherit' />
                      </IconButton> 
                    </Box>
                    <Box> 
                      <SearchBox
                        col={props.col} 
                        defaultRefinement='JAMN.IO'
                        surveyorState={surveyorState}
                        setSurveyorState={setSurveyorState}
                      />
                      <Hits
                        col={props.col}
                        surveyorState={surveyorState}
                        setSurveyorState={setSurveyorState}
                      />
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
                      surveyorState={surveyorState}
                      setSurveyorState={setSurveyorState}
                    />
                   </Box>
                </InstantSearch>
              : null
          }
    </Box>
  )
}