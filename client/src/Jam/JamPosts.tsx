import { useReactiveVar } from '@apollo/client';
import { Box } from '@mui/material';
import { useEffect } from 'react';
import { surveyorVar } from '../cache';
import Surveyor from '../Surveyor/Surveyor';
import { Jam } from '../types/Jam';
import { v4 as uuidv4 } from 'uuid';
import { SurveyorItem, SurveyorSlice, SurveyorState } from '../types/Surveyor';

interface JamPostsProps {
  jam: Jam;
}

export default function JamPosts(props: JamPostsProps) {
  const surveyorDetail = useReactiveVar(surveyorVar);

  useEffect(() => {
    if (!surveyorDetail[props.jam.id]) {
      const surveyorItem: SurveyorItem = {
        post: props.jam.focus,
        instanceId: uuidv4(),
        showPrev: false,
        showNext: false,
        prev: [],
        next: [],
        refresh: false,
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
        [props.jam.id]: surveyorState,
      });
    }
  }, []);

  return(
    <Box sx={{
      marginTop: '0px',
    }}>
      <Surveyor context={props.jam} />
    </Box>
  )
}