import { ReactiveVar, useReactiveVar } from '@apollo/client';
import { Box } from '@mui/material';
import { Dispatch, useEffect, useState } from 'react';
import Surveyor from '../Surveyor/Surveyor';
import { User } from '../types/User';
import { v4 as uuidv4 } from 'uuid';
import { SurveyorSlice, SurveyorState } from '../types/Surveyor';
import { Col } from '../types/Col';
import { PostAction } from '../types/Post';
import { Item } from '../types/Item';
import { itemVar } from '../cache';

interface UserProfileProps {
  user: User;
  col: Col;
  postDispatch: Dispatch<PostAction>;
}

export default function UserProfile(props: UserProfileProps) {
  const { dispatch } = useReactiveVar(itemVar);

  const [surveyorState, setSurveyorState] = useState(null as unknown as SurveyorState);

  useEffect(() => {
    const item: Item = {
      id: uuidv4(),
      postId: props.user.focusId,
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
  }, [])

  if (!surveyorState) return null;

  return(
    <Box sx={{
      height: 'calc(100% - 110px)'
    }}>
      <Surveyor 
        key={`surveyor-${props.col.id}`}
        col={props.col}
        postDispatch={props.postDispatch}
        surveyorState={surveyorState}
        setSurveyorState={setSurveyorState}
      />
    </Box>
  )
}