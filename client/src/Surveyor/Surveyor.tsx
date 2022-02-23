import { Box } from '@mui/material';
import React, { useRef, Dispatch } from 'react';
import { useReactiveVar } from '@apollo/client';
import { sizeVar, surveyorVar } from '../cache';
import { SurveyorItem } from '../types/Surveyor';
import SurveyorTree from './SurveyorTree';
import { Col } from '../types/Col';
import { PostAction } from '../types/Post';

interface SurveyorProps {
  col: Col;
  postDispatch: Dispatch<PostAction>;
}
export default function Surveyor(props: SurveyorProps) {
  const surveyorDetail = useReactiveVar(surveyorVar);
  const sizeDetail = useReactiveVar(sizeVar);
  const contentEl = useRef<HTMLElement>();

  const surveyorState = surveyorDetail[props.col.id];

  if (!surveyorState) return null;

  const handleBackClick = (event: React.MouseEvent) => {

  };

  const handleForwardClick = (event: React.MouseEvent) => {

  };

  const updateItem = (i: number) => (item: SurveyorItem) => {
    const items = surveyorState.stack[surveyorState.index].items.slice();
    items.splice(i, 1, item);

    const stack = surveyorState.stack.slice();
    stack.splice(surveyorState.index, 1, {
      ...surveyorState.stack[surveyorState.index],
      items,
    });
    surveyorVar({
      ...surveyorDetail,
      [props.col.id]: {
        ...surveyorState,
        stack,
      }
    });
  }

  return (
    <Box ref={contentEl} sx={{
      overflow: 'scroll', 
      width: '100%',
    }}>
      { 
        (surveyorState.stack[surveyorState.index]?.items || []).map((item, i) => {
          return (
            <SurveyorTree
              key={`surveyor-tree-${item.postKey}`}
              item={item}
              updateItem={updateItem(i)}
              depth={0}
              col={props.col}
              postDispatch={props.postDispatch}
            />
          );
        })
      }
    </Box>
  );
}