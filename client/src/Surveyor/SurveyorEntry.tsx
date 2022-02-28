import { Box, Button, Card, IconButton, Menu, MenuItem } from '@mui/material';
import NorthIcon from '@mui/icons-material/North';
import ReplyIcon from '@mui/icons-material/Reply';
import DoubleArrowIcon from '@mui/icons-material/DoubleArrow';
import ControlPointIcon from '@mui/icons-material/ControlPoint';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import LinkIcon from '@mui/icons-material/Link';
import AddCircleTwoToneIcon from '@mui/icons-material/AddCircleTwoTone';
import ChatBubbleTwoToneIcon from '@mui/icons-material/ChatBubbleTwoTone';
import FilterAltTwoToneIcon from '@mui/icons-material/FilterAltTwoTone';
import NotificationsTwoToneIcon from '@mui/icons-material/NotificationsTwoTone';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import { linkVar, paletteVar, userVar } from '../cache';
import { gql, useReactiveVar } from '@apollo/client';
import { Post, PostAction } from '../types/Post';
import { useApolloClient } from '@apollo/client';
import React, { Dispatch, SetStateAction, useContext, useEffect, useState } from 'react';
import { Link } from '../types/Link';
import { useSearchParams } from 'react-router-dom';
import { SurveyorState } from '../types/Surveyor';
import PostComponent from '../Post/PostComponent';
import useReplyPost from '../Post/useReplyPost';
import { Jam } from '../types/Jam';
import { FULL_POST_FIELDS, LINK_FIELDS, VOTE_FIELDS } from '../fragments';
import useGetPrev from '../Post/useGetPrev';
import useGetNext from '../Post/useGetNext';
import { Col } from '../types/Col';
import useLinkPosts from '../Post/useLinkPosts';
import { getColor } from '../utils';
import { Vote } from '../types/Vote';
import { DEFAULT_COLOR } from '../constants';
import useVotePosts from '../Post/useVotePosts';
import { Item } from '../types/Item';
import { ItemContext } from '../App';
import promoteItem from './promoteItem';
import useChangeCol from '../Col/useChangeCol';

interface SurveyorEntryProps {
  jam?: Jam;
  col: Col;
  item: Item;
  depth: number;
  surveyorState: SurveyorState;
  setSurveyorState: Dispatch<SetStateAction<SurveyorState>>;
}

export default function SurveyorEntry(props: SurveyorEntryProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  const client = useApolloClient();
  const userDetail = useReactiveVar(userVar);
  const linkDetail = useReactiveVar(linkVar);  
  const paletteDetail = useReactiveVar(paletteVar);

  const { state, dispatch } = useContext(ItemContext);

  const [menuAnchorEl, setMenuAnchorEl] = useState(null as Element | null);

  const [isVoting, setIsVoting] = useState(false);
  const { votePosts } = useVotePosts(setIsVoting)

  const { linkPosts } = useLinkPosts();

  const { getPrev } = useGetPrev(props.item.id, props.item.postId);
  const { getNext } = useGetNext(props.item.id, props.item.postId);

  const { replyPost } = useReplyPost(props.item.id, props.item.postId, props.jam?.id);

  const { changeCol } = useChangeCol();

  useEffect(() => {
    if (props.item.refresh) {
      if (props.item.showNext) {
        getNext(0);
      }
      else if (props.item.showPrev) {
        getPrev(0);
      }
      dispatch({
        type: 'UPDATE_ITEM',
        item: {
          ...props.item,
          refresh: false,
        }
      });

    }
  }, [props.item.refresh]);

  const handlePrevClick = (event: React.MouseEvent) => {
    if (props.item.showPrev) {
      dispatch({
        type: 'UPDATE_ITEM',
        item: {
          ...props.item,
          showPrev: false,
        }
      });
    }
    else {
      getPrev(props.item.prevIds.length);
      dispatch({
        type: 'UPDATE_ITEM',
        item: {
          ...props.item,
          showPrev: true,
          showNext: false,
        },
      });
    }
  }

  const handleNextClick = (event: React.MouseEvent) => {
    if (props.item.showNext) {
      dispatch({
        type: 'UPDATE_ITEM',
        item: {
          ...props.item,
          showNext: false,
        }
      });
    }
    else {
      getNext(props.item.nextIds.length);
      dispatch({
        type: 'UPDATE_ITEM',
        item: {
          ...props.item,
          showPrev: false,
          showNext: true,
        },
      });
    }
  }

  const handleReplyClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    replyPost();
  }

  const handleLinkClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (linkDetail.sourcePostId === props.item.postId) {
      linkVar({
        sourcePostId: '',
        targetPostId: '',
      });
    }
    else {
      linkVar({
        sourcePostId: props.item.postId,
        targetPostId: '', 
      })
    }
  }

  const handleMouseEnter = (event: React.MouseEvent) => {
    if (linkDetail.sourcePostId && linkDetail.sourcePostId !== props.item.postId) {
      linkVar({
        ...linkDetail,
        targetPostId: props.item.postId,
      });
    }
  }

  const handleMouseLeave = (event: React.MouseEvent) => {
    if (linkDetail.sourcePostId && linkDetail.sourcePostId !== props.item.postId) {
      linkVar({
        ...linkDetail,
        targetPostId: '',
      });
    }
  }

  const handleClick = (event: React.MouseEvent) => {
    if (linkDetail.sourcePostId === props.item.postId) {
      linkVar({
        sourcePostId: '',
        targetPostId: '',
      })
    }
    if (linkDetail.sourcePostId && linkDetail.targetPostId === props.item.postId) {
      linkPosts();
    }
  }

  const handleVoteClick = (clicks: number) => (event: React.MouseEvent) => {
    if (props.item.linkId) {
      votePosts(props.item.linkId, clicks);
      setIsVoting(true)
    }
  }

  const handleMenuOpenClick = (event: React.MouseEvent) => {
    setMenuAnchorEl(event.currentTarget);
  }
  const handleMenuClose = () => {
    setMenuAnchorEl(null)
  }

  const handleCopyClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    navigator.clipboard.writeText(`https://jamn.io/p/${props.item.postId}`);
    handleMenuClose();
  }

  const handleOpenClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    changeCol(props.col, `/p/${props.item.postId}`)
  }

  const handlePromoteClick = (event: React.MouseEvent) => { 
    event.stopPropagation();
    const { idToItem, rootItem } = promoteItem(state, props.item);

    dispatch({
      type: 'ADD_ITEMS',
      idToItem,
    });

    const stack = props.surveyorState.stack.slice();
    stack.push({
      originalQuery: '',
      query: '',
      itemIds: [rootItem.id],
    });
    props.setSurveyorState({
      ...props.surveyorState,
      stack,
      index: props.surveyorState.index + 1,
      triggerRefinement: false,
    });
  }

  const post = client.cache.readFragment({
    id: client.cache.identify({
      id: props.item.postId,
      __typename: 'Post',
    }),
    fragment: FULL_POST_FIELDS,
    fragmentName: 'FullPostFields',
  }) as Post;

  if (!post) return null;

  const link = props.item.linkId
  ? client.cache.readFragment({
      id: client.cache.identify({
        id: props.item.linkId,
        __typename: 'Link',
      }),
      fragment: gql`
        fragment LinkWithVotes on Link {
          ...LinkFields
          votes {
            ...VoteFields
          }
        }  
        ${LINK_FIELDS}
        ${VOTE_FIELDS}    
      `,
      fragmentName: 'LinkWithVotes'
    }) as Link
  : null;

  let userVote = null as Vote | null;
  if (link) {
    link.votes.some(vote => {
      if (vote.userId === userDetail?.id) {
        userVote = vote;
        return true;
      }
      return false;
    });
  }
  else if (props.item.linkId) {
    console.error('Missing link', props.item.linkId)
  }

  const color = getColor(paletteDetail.mode);

  const isLinking = (
    linkDetail.sourcePostId === props.item.postId || 
    linkDetail.targetPostId === props.item.postId
  );

  const slice = props.surveyorState.stack[props.surveyorState.index];
  return (
    <Card elevation={5} 
      onMouseEnter={handleMouseEnter} 
      onMouseLeave={handleMouseLeave} 
      onClick={handleClick}
      sx={{
        margin: 1,
        marginBottom: 0,
        width: 'calc(100% - 10px)',
        backgroundColor: isLinking
          ? getColor(paletteDetail.mode, true)
          : '',
        cursor: linkDetail.sourcePostId && linkDetail.sourcePostId !== props.item.postId
          ? 'crosshair'
          : '',
      }}
    >
      <PostComponent
        col={props.col}
        post={post}
        itemId={props.item.id}
      />
      <Box sx={{
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
      }}>
        {
          link 
            ? <Card variant='outlined' sx={{
                marginBottom: '5px',
              }}>
                <Button 
                  disabled={!userDetail || isVoting}
                  size='small' 
                  onClick={handleVoteClick(
                    userVote && userVote.weight === 1 
                      ? 0
                      : 1
                  )}
                  sx={{
                    fontSize:12,
                    color: (userVote?.weight || 0) > 0
                      ? userDetail?.color || DEFAULT_COLOR
                      : color,
                    minWidth: 0,
                    minHeight: 0,
                  }}
                >
                  { 
                    (userVote?.weight || 0) > 0
                      ? <ControlPointIcon fontSize='inherit' />
                      : '+'
                  }
                </Button>
                <Button
                  color='inherit'
                  size='small'
                  sx={{
                    fontSize: 10,
                    minWidth: 0,
                    minHeight: 0,
                    color,
                  }}
                >
                  { link.weight }
                </Button>
                <Button
                  disabled={!userDetail || isVoting}
                  size='small' 
                  onClick={handleVoteClick(
                    userVote && userVote.weight === -1
                      ? 0
                      : -1
                  )}
                  sx={{
                    fontSize: 12,
                    color: (userVote?.weight || 0) < 0
                      ? userDetail?.color || DEFAULT_COLOR
                      : color,
                    minWidth: 0,
                    minHeight: 0,
                  }}
                >
                  { 
                    (userVote?.weight || 0) < 0
                      ? <RemoveCircleOutlineIcon fontSize='inherit' />
                      : '-'
                  }
                </Button>
              </Card>
            : null
        }
        <Box sx={{ 
          padding: '5px', 
          marginTop: '-2px',
          whiteSpace: 'nowrap',
        }}>
          <Box component='span' sx={{whiteSpace: 'nowrap'}}>
            &nbsp;&nbsp;
            <IconButton
              disabled={!userDetail?.verifyEmailDate}
              size='small'
              color='inherit'
              onClick={handleReplyClick}
              sx={{
                fontSize: 14,
                color,
                padding: 0,
              }}
            >
              <ReplyIcon fontSize='inherit'/>
            </IconButton>
            &nbsp;&nbsp;
            <IconButton
              disabled={!userDetail?.verifyEmailDate}
              size='small'
              color='inherit'
              onClick={handleLinkClick}
              sx={{
                fontSize: 14,
                color,
                padding: 0,
              }}
            >
              <DoubleArrowIcon fontSize='inherit'/>
            </IconButton>
            &nbsp;&nbsp;
            <IconButton
              onClick={handleMenuOpenClick}
              size='small'
              color='inherit'
              sx={{
                fontSize: 14,
                color,
                padding: 0,
              }}
            >
              <MoreVertIcon fontSize='inherit' />
            </IconButton>
            <Menu
              open={!!menuAnchorEl}
              onClose={handleMenuClose}
              anchorEl={menuAnchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
            >
              <MenuItem onClick={handleCopyClick} sx={{
                fontSize: 14,
              }}>
                <Box sx={{
                  marginLeft: '-5px',
                  marginBottom: '-5px',
                  fontSize: 14,
                }}>
                  <LinkIcon fontSize='inherit'/>
                </Box>
                &nbsp; Copy hyperlink
              </MenuItem>
              <MenuItem onClick={handleOpenClick} sx={{
                fontSize: 14,
              }}>
                <Box sx={{
                  marginLeft: '-5px',
                  marginBottom: '-5px',
                  fontSize: 14,
                }}>
                  <ChatBubbleTwoToneIcon fontSize='inherit'/>
                </Box>
                &nbsp; Open post
              </MenuItem>
              {
                props.depth !== 0 || slice.itemIds.length !== 1
                  ? <MenuItem onClick={handlePromoteClick} sx={{
                      fontSize: 14,
                    }}>
                      <Box sx={{
                        marginLeft: '-5px',
                        marginBottom: '-5px',
                        fontSize: 14,
                      }}>
                        <NorthIcon fontSize='inherit' />
                      </Box>
                      &nbsp; Move to top
                    </MenuItem>
                  : null
              }
            </Menu>
            &nbsp;
          </Box>
        </Box>
        <Box>
        </Box>
        <Box sx={{
          color,
          paddingBottom: '5px',
          marginTop: '2px',
          whiteSpace: 'nowrap',
        }}>
          <Button 
            onClick={handlePrevClick}
            color='inherit'
            size='small'
            variant={props.item.showPrev ? 'outlined' : 'text'}
            sx={{
              fontSize: 10,
              minWidth: 0,
            }}
          >
            {post.prevCount} prev
          </Button>
          &nbsp;
          <Button 
            onClick={handleNextClick}
            color='inherit'
            size='small'
            variant={props.item.showNext ? 'outlined' : 'text'}
            sx={{
              fontSize: 10,
              maxWidth: '50px',
              minWidth: 0,
            }}
          >
            {post.nextCount} next
          </Button>
        </Box>
      </Box>
    </Card>
  )
}