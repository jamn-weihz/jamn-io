import { useReactiveVar } from '@apollo/client';
import { Box } from '@mui/material';
import { Dispatch, useEffect } from 'react';
import { surveyorVar } from '../cache';
import Surveyor from '../Surveyor/Surveyor';
import { Jam } from '../types/Jam';
import { v4 as uuidv4 } from 'uuid';
import { SurveyorItem, SurveyorSlice, SurveyorState } from '../types/Surveyor';
import { Col } from '../types/Col';
import { PostAction } from '../types/Post';

interface JamProfileProps {
  jam: Jam;
  col: Col;
  postDispatch: Dispatch<PostAction>;
}

export default function JamProfile(props: JamProfileProps) {
  const surveyorDetail = useReactiveVar(surveyorVar);

  useEffect(() => {
    const surveyorItem: SurveyorItem = {
      postId: props.jam.focusId,
      postKey: uuidv4(),
      showPrev: false,
      showNext: true,
      prev: [],
      next: [],
      refresh: true,
    };
    const surveyorSlice: SurveyorSlice = {
      originalQuery: '',
      query: '',
      items: [surveyorItem],
    };
    const surveyorState: SurveyorState = {
      index: 0,
      stack: [surveyorSlice],
      scrollToTop: false,
      reload: false,
      triggerRefinement: false,
    };
    surveyorVar({
      ...surveyorDetail,
      [props.col.id]: surveyorState,
    });
    console.log(props.col.id)
  }, []);

  return(
    <Box sx={{
      height: 'calc(100% - 110px)'
    }}>
      <Surveyor 
        key={`surveyor-${props.col.id}`}
        col={props.col}
        postDispatch={props.postDispatch}
      />
    </Box>
  )
}