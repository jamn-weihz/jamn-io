import { useReactiveVar } from '@apollo/client';
import {
  Box,
  FormControl,
  OutlinedInput,
  IconButton,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import React, { Dispatch, SetStateAction, useEffect } from 'react';
import { paletteVar, sizeVar } from '../cache';
import { connectSearchBox } from 'react-instantsearch-dom';

import { useSearchParams } from 'react-router-dom';
import { Col } from '../types/Col';
import { getColor, getColWidth } from '../utils';
import { SurveyorState } from '../types/Surveyor';

interface SearchBoxProps {
  col: Col;
  currentRefinement: string;
  isSearchStalled: boolean;
  refine: any;
  surveyorState: SurveyorState;
  setSurveyorState: Dispatch<SetStateAction<SurveyorState>>;
}

function SearchBox(props: SearchBoxProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const sizeDetail = useReactiveVar(sizeVar);
  const paletteDetail = useReactiveVar(paletteVar);

  useEffect(() => {
    if (props.surveyorState.triggerRefinement) {
      refineQuery();
      console.log('hello')
      props.setSurveyorState({
        ...props.surveyorState,
        triggerRefinement: false,
      });
    }
  }, [props.surveyorState.triggerRefinement])

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const stack = props.surveyorState.stack.slice();
    const slice = stack[props.surveyorState.index];
    stack.splice(props.surveyorState.index, 1, {
      ...slice,
      query: event.target.value,
    });
    props.setSurveyorState({
      ...props.surveyorState,
      stack,
    });
  }

  const refineQuery = () => {
    const slice = props.surveyorState.stack[props.surveyorState.index]
    props.refine(slice.query);
    const stack = props.surveyorState.stack.slice(0, props.surveyorState.index + 1);
    const query = stack[props.surveyorState.index].query;
    stack.push({
      originalQuery: query,
      query,
      itemIds: [],
    });
    props.setSurveyorState({
      ...props.surveyorState,
      stack,
      index: props.surveyorState.index + 1,
      triggerRefinement: false,
    });
  }

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      refineQuery();
    }
  }

  const color = getColor(paletteDetail.mode);

  const slice = props.surveyorState.stack[props.surveyorState.index];
  if (!slice) return null;
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
            fontSize: 14,
          }}
          id='query'
          type={'text'}
          value={slice.query}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          endAdornment={
            <InputAdornment position='end' sx={{
              marginRight: -1,
              color,
            }}> 
              <IconButton color='inherit' size='small' onClick={refineQuery}>
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