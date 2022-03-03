import { Box } from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import Surveyor from '../Card/CardSurveyor';
import { User } from '../types/User';
import { v4 as uuidv4 } from 'uuid';
import { SurveyorSlice, SurveyorState } from '../types/Surveyor';
import { ColUnit } from '../types/Col';
import { Card } from '../types/Card';
import { CardContext } from '../App';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../cache';

interface UserProfileProps {
  user: User;
  colUnit: ColUnit;
}

export default function UserProfile(props: UserProfileProps) {
  const { dispatch } = useContext(CardContext);

  const userDetail = useReactiveVar(userVar);

  const [surveyorState, setSurveyorState] = useState(null as unknown as SurveyorState);

  useEffect(() => {
    const card: Card = {
      id: uuidv4(),
      userId: props.user.id,
      parentId: '',
      linkId: '',
      postId: props.user.focusId,
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
  }, [])

  if (!surveyorState) return null;

  return(
    <Box sx={{
      height: userDetail?.id === props.user.id
        ? 'calc(100% - 150px)'
        : 'calc(100% - 110px)',
      overflow: 'scroll',
    }}>
      <Surveyor 
        key={`surveyor-${props.colUnit.col.id}`}
        colUnit={props.colUnit}
        surveyorState={surveyorState}
        setSurveyorState={setSurveyorState}
        hideOpaquePosts={false}
      />
    </Box>
  )
}