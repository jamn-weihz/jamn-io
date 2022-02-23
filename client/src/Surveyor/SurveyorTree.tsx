import { Box, IconButton, Link as MUILink } from '@mui/material';
import { Link } from '../types/Link';
import SurveyorEntry from './SurveyorEntry';
import React, { Dispatch } from 'react';

import { useApolloClient } from '@apollo/client';

import { SurveyorItem } from '../types/Surveyor';
import { User } from '../types/User';
import { Jam } from '../types/Jam';
import { FULL_POST_FIELDS, LINK_FIELDS } from '../fragments';
import { Post, PostAction } from '../types/Post';
import { Col } from '../types/Col';

interface SurveyorTreeProps {
  col: Col;
  item: SurveyorItem;
  updateItem(item: SurveyorItem): void;
  depth: number;
  postDispatch: Dispatch<PostAction>;
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

  const post = client.cache.readFragment({
    id: client.cache.identify({
      id: props.item.postId,
      __typename: 'Post',
    }),
    fragment: FULL_POST_FIELDS,
    fragmentName: 'FullPostFields',
  }) as Post;

  let remaining = 0;
  let items = [] as SurveyorItem[];
  if (props.item.showPrev) {
    items = props.item.prev;
    remaining = items.length > 0
      ? Math.min(20, post.prevCount - items.length)
      : 0;
  }
  else if (props.item.showNext) {
    items = props.item.next;
    remaining = items.length > 0 
      ? Math.min(20, post.nextCount - items.length)
      : 0;
  }

  const handleLoadClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
  }

  if (!post) return null;

  return (
    <Box>
      <Box sx={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
      }}>
        <SurveyorEntry
          col={props.col}
          item={props.item}
          updateItem={props.updateItem}
          depth={props.depth}
          postDispatch={props.postDispatch}
        />
      </Box>
      <Box sx={{
        borderLeft: `1px solid ${post.user.color}`,
        marginLeft: '7px',
      }}>
        {
          items.map((item, i) => {
            return (
              <SurveyorTree
                key={`surveyor-tree-${item.postKey}`}
                item={item}
                updateItem={updateChildItem(props.item.showNext, i)}
                depth={props.depth + 1}
                col={props.col}
                postDispatch={props.postDispatch}
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
                color: post.user.color,
              }}>
                <MUILink>load {remaining} more</MUILink>
              </Box>
            : null
        }
      </Box>
    </Box>
  );
}