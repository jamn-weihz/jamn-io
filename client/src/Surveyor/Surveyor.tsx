import { Box, Card, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import React, { useRef } from 'react';
import { useReactiveVar } from '@apollo/client';
import { sizeVar, surveyorVar } from '../cache';
import SearchBox from './SearchBox';
import { SurveyorItem } from '../types/Surveyor';
import SurveyorTree from './SurveyorTree';
import { APPBAR_HEIGHT } from '../constants';
import { User } from '../types/User';
import { Jam } from '../types/Jam';

interface SurveyorProps {
  context: User | Jam;
}
export default function Surveyor(props: SurveyorProps) {
  const surveyorDetail = useReactiveVar(surveyorVar);
  const sizeDetail = useReactiveVar(sizeVar);
  const contentEl = useRef<HTMLElement>();

  const surveyorState = surveyorDetail[props.context.id];
  console.log(surveyorDetail);
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
      [props.context.id]: {
        ...surveyorState,
        stack,
      }
    });
  }


  return (
    <Box>
      <Card elevation={5} sx={{
        display: 'flex',
        flexDirection: 'row',
        padding: 1,
        borderBottom: '1px solid grey',
      }}>
        <Box sx={{ whiteSpace: 'nowrap', paddingRight: 1,}}>
          <IconButton
            disabled={surveyorState.index <= 0} 
            size='small'
            onClick={handleBackClick}
          >
            <ArrowBackIcon fontSize='inherit' />
          </IconButton>
          <IconButton
            disabled={surveyorState.index >= surveyorState.stack.length - 1} 
            size='small'
            onClick={handleForwardClick}
          >
            <ArrowForwardIcon fontSize='inherit' />
          </IconButton> 
        </Box>
        <Box> 
          <SearchBox contextId={props.context.id} defaultRefinement='JAMN.IO' />
        </Box>
      </Card>
      <Box ref={contentEl} sx={{
        height: sizeDetail.height - (3 * APPBAR_HEIGHT),
        overflow: 'scroll', 
      }}>
        { 
          (surveyorState.stack[surveyorState.index]?.items || []).map((item, i) => {
            return (
              <SurveyorTree
                key={`surveyor-tree-${item.instanceId}`}
                item={item}
                updateItem={updateItem(i)}
                depth={0}
                context={props.context}
              />
            );
          })
        }
      </Box>
    </Box>
  );
}