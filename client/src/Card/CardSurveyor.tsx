import { Box } from '@mui/material';
import { useRef, Dispatch, SetStateAction, useEffect } from 'react';
import { SurveyorState } from '../types/Surveyor';
import CardTree from './CardTree';
import { ColUnit } from '../types/Col';
import { Jam } from '../types/Jam';
import { Post } from '../types/Post';

interface SurveyorProps {
  post?: Post;
  jam?: Jam;
  colUnit: ColUnit;
  hideOpaquePosts: boolean;
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
      width: '100%',
    }}>
      { 
        slice.cardIds.map((cardId, i) => {
          return (
            <CardTree
              key={`surveyor-tree-${cardId}`}
              cardId={cardId}
              depth={0}
              colUnit={props.colUnit}
              surveyorState={props.surveyorState}
              setSurveyorState={props.setSurveyorState}
              jam={props.jam}
              post={props.post}
              hideOpaquePosts={props.hideOpaquePosts}
            />
          );
        })
      }
      <Box sx={{height: '10px'}}/>
    </Box>
  );
}