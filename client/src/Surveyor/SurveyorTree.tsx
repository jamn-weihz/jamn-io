import { Box, Link as MUILink } from '@mui/material';
import SurveyorEntry from './SurveyorEntry';
import React, { Dispatch, SetStateAction, useContext } from 'react';

import { useApolloClient } from '@apollo/client';

import { SurveyorState } from '../types/Surveyor';
import { FULL_POST_FIELDS } from '../fragments';
import { Post, PostAction } from '../types/Post';
import { Col } from '../types/Col';
import useGetPrev from '../Post/useGetPrev';
import useGetNext from '../Post/useGetNext';
import { LOAD_LIMIT } from '../constants';
import { ItemContext } from '../App';
import { Jam } from '../types/Jam';

interface SurveyorTreeProps {
  jam?: Jam;
  col: Col;
  itemId: string;
  depth: number;
  surveyorState: SurveyorState;
  setSurveyorState: Dispatch<SetStateAction<SurveyorState>>;
}
export default function SurveyorTree(props: SurveyorTreeProps) {
  const client = useApolloClient();

  const {state, dispatch} = useContext(ItemContext);
  const item = state[props.itemId];

  const { getPrev } = useGetPrev(props.itemId, item?.postId);
  const { getNext } = useGetNext(props.itemId, item?.postId);

  if (!item) return null;

  const handleLoadClick = (event: React.MouseEvent) => {
    if (item.showPrev) {
      getPrev(item.prevIds.length);
    }
    else if (item.showNext) {
      getNext(item.nextIds.length);
    }
  }

  const post = client.cache.readFragment({
    id: client.cache.identify({
      id: item.postId,
      __typename: 'Post',
    }),
    fragment: FULL_POST_FIELDS,
    fragmentName: 'FullPostFields',
  }) as Post;

  let remaining = 0;
  let itemIds = [] as string[];
  if (item.showPrev) {
    itemIds = item.prevIds;
    remaining = itemIds.length > 0
      ? Math.min(LOAD_LIMIT, post.prevCount - itemIds.length)
      : 0;
  }
  else if (item.showNext) {
    itemIds = item.nextIds;
    remaining = itemIds.length > 0 
      ? Math.min(LOAD_LIMIT, post.nextCount - itemIds.length)
      : 0;
  }

  if (!post) return null;

  if (post.isOpaque) return null;

  return (
    <Box>
      <Box sx={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
      }}>
        <SurveyorEntry
          col={props.col}
          item={item}
          depth={props.depth}
          surveyorState={props.surveyorState}
          setSurveyorState={props.setSurveyorState}
          jam={props.jam}
        />
      </Box>
      <Box sx={{
        borderLeft: `1px solid ${post.user.color}`,
        marginLeft: '8px',
      }}>
        {
          itemIds.map(itemId => {
            return (
              <SurveyorTree
                key={`surveyor-tree-${itemId}`}
                itemId={itemId}
                depth={props.depth + 1}
                col={props.col}
                surveyorState={props.surveyorState}
                setSurveyorState={props.setSurveyorState}
                jam={props.jam}
              />
            )
          })
        }
        {
          remaining > 0
            ? <Box onClick={handleLoadClick} sx={{
                fontSize: 12,
                marginTop: '5px',
                marginLeft: '10px',
                textAlign: 'left',
                cursor: 'pointer',
              }}>
                <MUILink sx={{
                  color: post.user.color,
                }}>
                  load {remaining} more
                </MUILink>
              </Box>
            : null
        }
      </Box>
    </Box>
  );
}