import { Box, IconButton, Link as MUILink } from '@mui/material';
import { Link } from '../types/Link';
import SurveyorEntry from './SurveyorEntry';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { Vote } from '../types/Vote';
import React, { Dispatch, useEffect } from 'react';

import { v4 as uuidv4 } from 'uuid';
import { gql, useApolloClient } from '@apollo/client';

import { SurveyorItem } from '../types/Surveyor';
import { User } from '../types/User';
import { Jam } from '../types/Jam';

interface SurveyorTreeProps {
  context: User | Jam;
  item: SurveyorItem;
  updateItem(item: SurveyorItem): void;
  depth: number;
}
export default function SurveyorTree(props: SurveyorTreeProps) {
  const client = useApolloClient();

  const voteOnLink = (clicks: number) => (event: React.MouseEvent) => {

  }

  const updateChildItem = (isNext: boolean, i: number) => (item: SurveyorItem) => {
    let prev = props.item.prev;
    let next = props.item.next;
    if (isNext) {
      next = next.slice();
      next.splice(i, 1, item);
    }
    else {
      prev = prev.slice();
      prev.splice(i, 1, item);
    }
    const updatedItem = {
      ...props.item,
      prev,
      next,
    }
    props.updateItem({
      ...props.item,
      prev,
      next,
    })
  }

  const weight = 0;

  let remaining = 0;
  let items = [] as SurveyorItem[];
  if (props.item.showPrev) {
    items = props.item.prev;
    remaining = items.length > 0
      ? Math.min(20, props.item.post.prevCount - items.length)
      : 0;
  }
  else if (props.item.showNext) {
    items = props.item.next;
    remaining = items.length > 0 
      ? Math.min(20, props.item.post.nextCount - items.length)
      : 0;
  }

  const handleLoadClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
  }

  return (
    <Box>
      <Box sx={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
      }}>
        {
          props.item.link
            ? <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                marginLeft: '0px',
                marginRight: '-4px',
              }}>
                <IconButton
                  onClick={voteOnLink(weight > 0 ? 0 : 1)} 
                  color={weight > 0 ? 'primary' : 'secondary'} 
                  size='small' 
                  sx={{
                    opacity: weight > 0 ? 1 : .4,
                    fontSize: 20,
                  }}
                >
                  <ArrowDropUpIcon fontSize='inherit' />
                </IconButton>
                <Box sx={{
                  color: 'dimgrey'
                }}>
                { props.item.link.weight }
                </Box>
                <IconButton
                  onClick={voteOnLink(weight < 0 ? 0 : -1)} 
                  color={weight < 0 ? 'primary' : 'secondary'} 
                  size='small' 
                  sx={{
                    opacity: weight < 0 ? 1 : .4,
                    fontSize: 20,
                  }}
                >
                  <ArrowDropDownIcon fontSize='inherit' />
                </IconButton>
              </Box>
            : null
        }
        <SurveyorEntry
          context={props.context}
          post={props.item.post}
          showPrev={props.item.showPrev}
          showNext={props.item.showNext}
          item={props.item}
          updateItem={props.updateItem}
          depth={props.depth}
        />
      </Box>
      <Box sx={{
        borderLeft: props.depth > 0
          ? '3px solid lavender'
          : 'none',
        marginLeft: props.depth > 0
          ? '12px'
          : '0px'
      }}>
        {
          items.map((item, i) => {
            return (
              <SurveyorTree
                key={`surveyor-tree-${item.instanceId}`}
                item={item}
                updateItem={updateChildItem(props.item.showNext, i)}
                depth={props.depth + 1}
                context={props.context}
              />
            )
          })
        }
        {
          remaining > 0
            ? <Box onClick={handleLoadClick} sx={{
                fontSize: 12,
                marginLeft: '35px',
                textAlign: 'left',
                cursor: 'pointer'
              }}>
                <MUILink>load {remaining} more</MUILink>
              </Box>
            : null
        }
      </Box>
    </Box>
  );
}