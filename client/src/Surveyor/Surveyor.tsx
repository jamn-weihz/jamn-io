import { Box } from '@mui/material';
import { useRef, Dispatch, SetStateAction, useEffect } from 'react';
import { SurveyorState } from '../types/Surveyor';
import SurveyorTree from './SurveyorTree';
import { Col } from '../types/Col';
import { Jam } from '../types/Jam';
import { Post } from '../types/Post';

interface SurveyorProps {
  post?: Post;
  jam?: Jam;
  col: Col;
  surveyorState: SurveyorState;
  setSurveyorState: Dispatch<SetStateAction<SurveyorState>>;
}

export default function Surveyor(props: SurveyorProps) {
  const contentEl = useRef<HTMLElement>();

  useEffect(() => {
    if (props.surveyorState.reload) {
      props.setSurveyorState({
        ...props.surveyorState,
        reload: false,
      });
    }
  }, [props.surveyorState.reload]);

  const slice = props.surveyorState.stack[props.surveyorState.index];
  return (
    <Box ref={contentEl} sx={{
      overflow: 'scroll', 
      width: '100%',
    }}>
      { 
        slice.itemIds.map((itemId, i) => {
          return (
            <SurveyorTree
              key={`surveyor-tree-${itemId}`}
              itemId={itemId}
              depth={0}
              col={props.col}
              surveyorState={props.surveyorState}
              setSurveyorState={props.setSurveyorState}
              jam={props.jam}
              post={props.post}
            />
          );
        })
      }
      <Box sx={{height: '150px'}}/>
    </Box>
  );
}