import { useApolloClient, useReactiveVar } from '@apollo/client';
import { Box, Button, Card } from '@mui/material';
import { paletteVar, userVar } from '../cache';
import { FULL_POST_FIELDS } from '../fragments';
import { Post, PostAction } from '../types/Post';
import { getColor, getTimeString } from '../utils';
import CharCounter from './CharCounter';
import Editor from './Editor/Editor';
import { convertFromRaw } from 'draft-js';
import React, { Dispatch, useContext, useEffect } from 'react';
import useChangeCol from '../Col/useChangeCol';
import { Col } from '../types/Col';
import ColLink from '../Col/ColLink';
import { PostContext } from '../App';

interface PostComponentProps {
  col: Col;
  post: Post;
  itemId: string;
}
export default function PostComponent(props: PostComponentProps) {
  const { changeCol } = useChangeCol();
  const { dispatch } = useContext(PostContext);
  const client = useApolloClient();
  const userDetail = useReactiveVar(userVar);
  const paletteDetail = useReactiveVar(paletteVar);

  useEffect(() => {
    if (dispatch) {
      dispatch({
        type: 'ADD',
        postId: props.post.id,
        itemId: props.itemId,
      });
      return () => {
        dispatch({
          type: 'REMOVE',
          postId: props.post.id,
          itemId: props.itemId,
        });
      };
    }
  }, [dispatch]);

  const post = client.cache.readFragment({
    id: client.cache.identify(props.post),
    fragment: FULL_POST_FIELDS,
    fragmentName: 'FullPostFields',
  }) as Post;

  const handleCommitClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
  }

  const time = new Date(post.saveDate).getTime();
  const timeString = getTimeString(time);

  let count = 0;
  if (post.draft) {
    const contentState = convertFromRaw(JSON.parse(post.draft));
    count = contentState.getPlainText('\n').length;
  }
  const limit = 1000;

  return (
    <Card variant='outlined' sx={{
      margin: 1,
      padding: 1,
      border: props.post.userId === userDetail?.id
        ? `1px solid ${userDetail.color}`
        : null
    }}>
      <Box sx={{
        fontSize: 14,
        color: getColor(paletteDetail.mode),
        paddingBottom: '4px',
      }}>
        <ColLink
          col={props.col} 
          pathname={`/u/${post.user.name}`}
          sx={{
            color: post.user.color,
          }}
        >
          {`u/${post.user.name}`}
        </ColLink>
        { ' ' }
        { timeString }
        { ' ' }
        {
          post.jam
            ? <ColLink 
                col={props.col}
                pathname={`/j/${post.jam?.name}`}
                sx={{
                  color: post.jam.color,
                }}
              >
                {`j/${post.jam.name}`}
              </ColLink>
            : null
        }
      </Box>
      <Box>
        <Editor post={post} isReadonly={false} />
      </Box>
      <Box sx={{
        display: false && post.userId === userDetail?.id && !post.commitDate
          ? 'flex' 
          : 'none',
        justifyContent: 'center',
      }}>
        <Button disabled={true} size='small' onClick={handleCommitClick} sx={{
          fontSize: 12,
          marginBottom: '-3px',
        }}>
          Commit
        </Button>&nbsp;&nbsp;
        <CharCounter count={count} limit={limit} />
      </Box>
    </Card>
  )

}