import { useReactiveVar } from '@apollo/client';
import {
  Box,
  FormControl,
  OutlinedInput,
  IconButton,
  InputAdornment,
  Tooltip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import React, { useEffect } from 'react';
import { sizeVar, surveyorVar } from '../cache';
import { connectSearchBox } from 'react-instantsearch-dom';

import { useSearchParams } from 'react-router-dom';
import { Col } from '../types/Col';
import { getColWidth } from '../utils';

interface SearchBoxProps {
  col: Col;
  currentRefinement: string;
  isSearchStalled: boolean;
  refine: any;
}

function SearchBox(props: SearchBoxProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  const sizeDetail = useReactiveVar(sizeVar);
  const surveyorDetail = useReactiveVar(surveyorVar);

  const surveyorState = surveyorDetail[props.col.id];

  useEffect(() => {
    if (surveyorState.triggerRefinement) {
      refineQuery();
      surveyorVar({
        ...surveyorDetail,
        [props.col.id]:  {
          ...surveyorState,
          triggerRefinement: false,
        },
      });
    }
  }, [surveyorState.triggerRefinement])

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const stack = surveyorState.stack.slice();
    stack.splice(surveyorState.index, 1, {
      ...surveyorState.stack[surveyorState.index],
      query: event.target.value,
    });
    surveyorVar({
      ...surveyorDetail,
      [props.col.id]:  {
        ...surveyorState,
        stack,
      },
    });
  }

  const refineQuery = () => {
    props.refine(surveyorState.stack[surveyorState.index].query);
    const stack = surveyorState.stack.slice(0, surveyorState.index + 1);
    const query = stack[surveyorState.index].query;
    stack.push({
      originalQuery: query,
      query,
      items: [],
    });
    surveyorVar({
      ...surveyorDetail,
      [props.col.id]:  {
        ...surveyorState,
        stack,
        index: surveyorState.index + 1,
      }
    });

    setSearchParams({ query })
  }

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      refineQuery();
    }
  }

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'row',
    }}>
      <FormControl variant={'outlined'}>
        <OutlinedInput
          sx={{
            height: 30, 
            width: getColWidth(sizeDetail.width) - 100,
          }}
          id='query'
          type={'text'}
          value={surveyorState.stack[surveyorState.index].query}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          endAdornment={
            <InputAdornment position='end' sx={{
              marginRight: -1,
            }}> 
              <IconButton color={'inherit'} size={'small'} onClick={refineQuery}>
                <SearchIcon fontSize='inherit'/>
              </IconButton>
              
            </InputAdornment>
          }
        />
      </FormControl>
    </Box>
  )
}

const CustomSearchBox = connectSearchBox(SearchBox)

export default CustomSearchBox