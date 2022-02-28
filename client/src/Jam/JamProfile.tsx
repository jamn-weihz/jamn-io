import { ReactiveVar, useReactiveVar } from '@apollo/client';
import { Box } from '@mui/material';
import { Dispatch, useContext, useEffect, useState } from 'react';
import Surveyor from '../Surveyor/Surveyor';
import { Jam } from '../types/Jam';
import { v4 as uuidv4 } from 'uuid';
import { SurveyorSlice, SurveyorState } from '../types/Surveyor';
import { Col } from '../types/Col';
import { PostAction } from '../types/Post';
import { Item } from '../types/Item';
import { ItemContext } from '../App';

interface JamProfileProps {
  jam: Jam;
  col: Col;
}

export default function JamProfile(props: JamProfileProps) {
  const { dispatch } = useContext(ItemContext);
  const [surveyorState, setSurveyorState] = useState(null as unknown as SurveyorState);

  useEffect(() => {
    const item: Item = {
      id: uuidv4(),
      parentId: '',
      linkId: '',
      postId: props.jam.focusId,
      showPrev: false,
      showNext: true,
      prevIds: [],
      nextIds: [],
      refresh: true,
    };
    dispatch({
      type: 'ADD_ITEMS',
      idToItem: {
        [item.id]: item
      },
    });
    const surveyorSlice: SurveyorSlice = {
      originalQuery: '',
      query: '',
      itemIds: [item.id],
    };
    const surveyorState: SurveyorState = {
      index: 0,
      stack: [surveyorSlice],
      scrollToTop: false,
      reload: false,
      triggerRefinement: false,
    };
    setSurveyorState(surveyorState)
  }, []);

  if (!surveyorState) return null;

  return(
    <Box sx={{
      height: 'calc(100% - 110px)'
    }}>
      <Surveyor 
        key={`surveyor-${props.col.id}`}
        col={props.col}
        surveyorState={surveyorState}
        setSurveyorState={setSurveyorState}
        jam={props.jam}
      />
    </Box>
  )
}