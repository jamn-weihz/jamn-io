import { Box } from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import Surveyor from '../Surveyor/Surveyor';
import { User } from '../types/User';
import { v4 as uuidv4 } from 'uuid';
import { SurveyorSlice, SurveyorState } from '../types/Surveyor';
import { ColUnit } from '../types/Col';
import { Item } from '../types/Item';
import { ItemContext } from '../App';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../cache';

interface UserProfileProps {
  user: User;
  colUnit: ColUnit;
}

export default function UserProfile(props: UserProfileProps) {
  const { dispatch } = useContext(ItemContext);

  const userDetail = useReactiveVar(userVar);

  const [surveyorState, setSurveyorState] = useState(null as unknown as SurveyorState);

  useEffect(() => {
    const item: Item = {
      id: uuidv4(),
      parentId: '',
      linkId: '',
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
        ? 'calc(100% - 120px)'
        : 'calc(100% - 90px)',
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