import { useApolloClient, useReactiveVar } from '@apollo/client';
import { Box, Button, IconButton } from '@mui/material';
import { paletteVar, userVar } from '../cache';
import { FULL_POST_FIELDS } from '../fragments';
import { Post } from '../types/Post';
import { getColor, getTimeString } from '../utils';
import CharCounter from './CharCounter';
import Editor from './Editor/Editor';
import { convertFromRaw } from 'draft-js';
import React, { useContext, useEffect } from 'react';
import { ColUnit } from '../types/Col';
import ColLink from '../Col/ColLink';
import { PostContext } from '../App';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import CheckCircleTwoToneIcon from '@mui/icons-material/CheckCircleTwoTone';
import useFollowUser from '../User/useFollowUser';
import useUnfollowUser from '../User/useUnfollowUser';

interface PostComponentProps {
  colUnit: ColUnit;
  post: Post;
  cardId: string;
}
export default function PostComponent(props: PostComponentProps) {
  const { dispatch } = useContext(PostContext);
  const client = useApolloClient();
  const userDetail = useReactiveVar(userVar);
  const paletteDetail = useReactiveVar(paletteVar);

  useEffect(() => {
    if (dispatch) {
      dispatch({
        type: 'ADD',
        postId: props.post.id,
        cardId: props.cardId,
      });
      return () => {
        dispatch({
          type: 'REMOVE',
          postId: props.post.id,
          cardId: props.cardId,
        });
      };
    }
  }, [dispatch]);

  const post = client.cache.readFragment({
    id: client.cache.identify(props.post),
    fragment: FULL_POST_FIELDS,
    fragmentName: 'FullPostFields',
  }) as Post;

  const { followUser } = useFollowUser();
  const { unfollowUser } = useUnfollowUser();

  const handleCommitClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
  }

  const handleUnfollowClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    unfollowUser(post.userId);
  }

  const handleFollowClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    followUser(post.userId);
  }

  const time = new Date(post.saveDate).getTime();
  const timeString = getTimeString(time);

  let count = 0;
  if (post.draft) {
    const contentState = convertFromRaw(JSON.parse(post.draft));
    count = contentState.getPlainText('\n').length;
  }
  const limit = 1000;

  const isFollowing = (userDetail?.leaders || []).some(lead => {
    return lead.leaderUserId === post.userId;
  });

  return (
    <Box sx={{
      margin:1,
    }}>
      <Box sx={{
        fontSize: 14,
        color: getColor(paletteDetail.mode),
        paddingBottom: '4px',
      }}>
        <ColLink
          col={props.colUnit.col} 
          pathname={`/u/${post.user.name}`}
          sx={{
            color: post.user.color,
          }}
        >
          {`u/${post.user.name}`}
        </ColLink>
        {
          !userDetail?.id || post.user.id === userDetail?.id
            ? null
            : <Box component='span'>
                {
                  isFollowing
                    ? <IconButton 
                        onClick={handleUnfollowClick}
                        title={`Unfollow u/${post.user.name}`}
                        size='small'
                        sx={{
                          marginTop: '-2px',
                          marginLeft: '2px',
                          padding: 0,
                          fontSize: 16,
                        }}
                      >
                        <CheckCircleTwoToneIcon fontSize='inherit' sx={{
                          color: userDetail?.color || getColor(paletteDetail.mode)
                        }}/>
                      </IconButton>
                    : <IconButton 
                        onClick={handleFollowClick}
                        title={`Follow u/${post.user.name}`}
                        size='small' 
                        sx={{
                          marginTop: '-2px',
                          marginLeft: '2px',
                          padding: 0,
                          fontSize: 12,
                        }}
                      >
                        <RadioButtonUncheckedIcon fontSize='inherit' sx={{
                          color: getColor(paletteDetail.mode)
                        }}/>
                      </IconButton>
                }
              </Box>
        }
        { ' ' }
        { timeString }
        { ' ' }
        {
          post.jam
            ? <ColLink 
                col={props.colUnit.col}
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
        <Editor
          post={post}
          isReadonly={false}
          colUnit={props.colUnit}
          cardId={props.cardId}
        />
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
    </Box>
  )

}