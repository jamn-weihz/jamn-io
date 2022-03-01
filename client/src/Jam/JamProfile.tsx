import { Box } from '@mui/material';
import {  useContext, useEffect, useState } from 'react';
import Surveyor from '../Surveyor/Surveyor';
import { Jam } from '../types/Jam';
import { v4 as uuidv4 } from 'uuid';
import { SurveyorSlice, SurveyorState } from '../types/Surveyor';
import { ColUnit } from '../types/Col';
import { Item } from '../types/Item';
import { ItemContext } from '../App';

interface JamProfileProps {
  jam: Jam;
  colUnit: ColUnit;
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
        key={`surveyor-${props.colUnit.col.id}`}
        colUnit={props.colUnit}
        surveyorState={surveyorState}
        setSurveyorState={setSurveyorState}
        jam={props.jam}
      />
    </Box>
  )
}