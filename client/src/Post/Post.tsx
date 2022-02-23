import { useApolloClient, useReactiveVar } from '@apollo/client';
import { Box, Button, Card, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { linkVar, userVar } from '../cache';
import { FULL_POST_FIELDS } from '../fragments';
import { Post, PostAction } from '../types/Post';
import { getTimeString } from '../utils';
import CharCounter from './CharCounter';
import Editor from './Editor';
import { convertFromRaw } from 'draft-js';
import React, { Dispatch, useEffect } from 'react';

interface PostComponentProps {
  post: Post;
  postKey: string;
  postDispatch: Dispatch<PostAction>;
}
export default function PostComponent(props: PostComponentProps) {
  const navigate = useNavigate();

  const client = useApolloClient();
  const userDetail = useReactiveVar(userVar);
  const linkDetail = useReactiveVar(linkVar);

  useEffect(() => {
    props.postDispatch({
      type: 'ADD',
      postId: props.post.id,
      postKey: props.postKey,
    });
    return () => {
      props.postDispatch({
        type: 'REMOVE',
        postId: props.post.id,
        postKey: props.postKey,
      });
    };
  }, []);

  const post = client.cache.readFragment({
    id: client.cache.identify(props.post),
    fragment: FULL_POST_FIELDS,
    fragmentName: 'FullPostFields',
  }) as Post;

  const handleUserClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    navigate(`/u/${encodeURIComponent(post.user.name)}`);
  };

  const handleJamClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    navigate(`/j/${encodeURIComponent(post.jam?.name || '')}`);
  };

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

  const isLinking = (
    linkDetail.sourcePostId === props.post.id || 
    linkDetail.targetPostId === props.post.id
  );
  return (
    <Card variant='outlined' sx={{
      margin: 1,
      padding: 1,
      backgroundColor: isLinking
        ? 'lavender'
        : 'white'

    }}>
      <Box sx={{
        fontSize: 14,
        color: 'dimgrey',
      }}>
        <Link onClick={handleUserClick} sx={{
          display: 'inline-block',
          cursor: 'pointer',
          color: post.user.color,
        }}>
          u/{post.user.name}
        </Link>
        &nbsp;
        { timeString }
        &nbsp;
        {
          post.jam
            ? <Box component='span'>
                <Link onClick={handleJamClick} sx={{
                  cursor: 'pointer',
                  color: post.jam.color,
                }}>
                  j/{post.jam.name}
                </Link>
              </Box>
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