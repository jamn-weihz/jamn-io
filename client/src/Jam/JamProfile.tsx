import { Box } from '@mui/material';
import {  useContext, useEffect, useState } from 'react';
import Surveyor from '../Card/CardSurveyor';
import { Jam } from '../types/Jam';
import { v4 as uuidv4 } from 'uuid';
import { SurveyorSlice, SurveyorState } from '../types/Surveyor';
import { ColUnit } from '../types/Col';
import { Card } from '../types/Card';
import { CardContext } from '../App';

interface JamProfileProps {
  jam: Jam;
  colUnit: ColUnit;
}

export default function JamProfile(props: JamProfileProps) {
  const { dispatch } = useContext(CardContext);
  const [surveyorState, setSurveyorState] = useState(null as unknown as SurveyorState);

  useEffect(() => {
    const card: Card = {
      id: uuidv4(),
      userId: props.jam.focus.userId,
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
      isRootRecentUserVoteCard: false,
    };
    dispatch({
      type: 'MERGE_ITEMS',
      idToCard: {
        [card.id]: card
      },
    });
    const surveyorSlice: SurveyorSlice = {
      originalQuery: '',
      query: '',
      cardIds: [card.id],
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
      overflowY: 'scroll',
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