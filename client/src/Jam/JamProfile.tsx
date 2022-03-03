import { Box } from '@mui/material';
import {  useContext, useEffect, useState } from 'react';
import Surveyor from '../Item/ItemSurveyor';
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
      isNewlySaved: false,
      refreshPost: false,
      getLinks: true,
    };
    dispatch({
      type: 'MERGE_ITEMS',
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
      reload: false,
      triggerRefinement: false,
      scrollToTop: false,
      scrollToBottom: false,
    };
    setSurveyorState(surveyorState)
  }, []);

  if (!surveyorState) return null;

  return(
    <Box sx={{
      height: 'calc(100% - 90px)',
      overflow: 'scroll',
    }}>
      <Surveyor 
        key={`surveyor-${props.colUnit.col.id}`}
        colUnit={props.colUnit}
        surveyorState={surveyorState}
        setSurveyorState={setSurveyorState}
        jam={props.jam}
        hideOpaquePosts={false}
      />
    </Box>
  )
}