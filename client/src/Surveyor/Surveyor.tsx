import { Box } from '@mui/material';
import { useRef, Dispatch, SetStateAction } from 'react';
import { SurveyorState } from '../types/Surveyor';
import SurveyorTree from './SurveyorTree';
import { Col } from '../types/Col';
import { PostAction } from '../types/Post';

interface SurveyorProps {
  col: Col;
  postDispatch: Dispatch<PostAction>;
  surveyorState: SurveyorState;
  setSurveyorState: Dispatch<SetStateAction<SurveyorState>>;
}

export default function Surveyor(props: SurveyorProps) {
  const contentEl = useRef<HTMLElement>();

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
              postDispatch={props.postDispatch}
              surveyorState={props.surveyorState}
              setSurveyorState={props.setSurveyorState}
            />
          );
        })
      }
      <Box sx={{height: '150px'}}/>
    </Box>
  );
}