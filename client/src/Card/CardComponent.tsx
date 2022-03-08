import { Box, Button, Card as MUICard, IconButton, Menu, MenuItem } from '@mui/material';
import NorthIcon from '@mui/icons-material/North';
import ReplyIcon from '@mui/icons-material/Reply';
import DoubleArrowIcon from '@mui/icons-material/DoubleArrow';
import ControlPointIcon from '@mui/icons-material/ControlPoint';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import LinkIcon from '@mui/icons-material/Link';
import ChatBubbleTwoToneIcon from '@mui/icons-material/ChatBubbleTwoTone';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import FilterAltTwoToneIcon from '@mui/icons-material/FilterAltTwoTone';
import NotificationsTwoToneIcon from '@mui/icons-material/NotificationsTwoTone';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import { linkVar, paletteVar, userVar } from '../cache';
import { gql, useReactiveVar } from '@apollo/client';
import { Post, PostAction } from '../types/Post';
import { useApolloClient } from '@apollo/client';
import React, { Dispatch, SetStateAction, useContext, useEffect, useState } from 'react';
import { Link } from '../types/Link';
import { SurveyorState } from '../types/Surveyor';
import PostComponent from '../Post/PostComponent';
import useReplyPost from '../Post/useReplyPost';
import { Jam } from '../types/Jam';
import { FULL_POST_FIELDS, LINK_FIELDS, POST_FIELDS, VOTE_FIELDS } from '../fragments';
import useGetPrev from '../Post/useGetPrev';
import useGetNext from '../Post/useGetNext';
import { ColUnit } from '../types/Col';
import useLinkPosts from '../Post/useLinkPosts';
import { getColor } from '../utils';
import { Vote } from '../types/Vote';
import { DEFAULT_COLOR } from '../constants';
import useVotePosts from '../Post/useVotePosts';
import { Card } from '../types/Card';
import { CardContext } from '../App';
import promoteCard from './promoteCard';
import useChangeCol from '../Col/useChangeCol';
import useSubPost from '../Post/useSubPost';
import useUnsubPost from '../Post/useUnsubPost';

interface CardComponentProps {
  post?: Post;
  jam?: Jam;
  colUnit: ColUnit;
  card: Card;
  depth: number;
  surveyorState: SurveyorState;
  setSurveyorState: Dispatch<SetStateAction<SurveyorState>>;
}

export default function CardComponent(props: CardComponentProps) {
  const client = useApolloClient();
  const userDetail = useReactiveVar(userVar);
  const linkDetail = useReactiveVar(linkVar);  
  const paletteDetail = useReactiveVar(paletteVar);

  const { state, dispatch } = useContext(CardContext);

  const [menuAnchorEl, setMenuAnchorEl] = useState(null as Element | null);

  const [isVoting, setIsVoting] = useState(false);
  const { votePosts } = useVotePosts(setIsVoting)

  const { linkPosts } = useLinkPosts();

  const { getPrev } = useGetPrev(props.card.id, props.card.postId);
  const { getNext } = useGetNext(props.card.id, props.card.postId);

  const { replyPost } = useReplyPost(props.card.id, props.card.postId, props.jam?.id);

  const { changeCol } = useChangeCol(0, true);

  const { subPost } = useSubPost()
  const { unsubPost } = useUnsubPost(props.card.postId);

  useEffect(() => {
    if (props.card.getLinks) {
      if (props.card.showNext) {
        getNext(0);
      }
      else if (props.card.showPrev) {
        getPrev(0);
      }
      dispatch({
        type: 'UPDATE_ITEM',
        card: {
          ...props.card,
          getLinks: false,
        }
      });

    }
  }, [props.card.getLinks]);

  const handlePrevClick = (event: React.MouseEvent) => {
    if (props.card.showPrev) {
      dispatch({
        type: 'UPDATE_ITEM',
        card: {
          ...props.card,
          showPrev: false,
        }
      });
    }
    else {
      getPrev(props.card.prevIds.length);
      dispatch({
        type: 'UPDATE_ITEM',
        card: {
          ...props.card,
          showPrev: true,
          showNext: false,
        },
      });
    }
  }

  const handleNextClick = (event: React.MouseEvent) => {
    if (props.card.showNext) {
      dispatch({
        type: 'UPDATE_ITEM',
        card: {
          ...props.card,
          showNext: false,
        }
      });
    }
    else {
      getNext(props.card.nextIds.length);
      dispatch({
        type: 'UPDATE_ITEM',
        card: {
          ...props.card,
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
    if (linkDetail.sourcePostId === props.card.postId) {
      linkVar({
        sourcePostId: '',
        targetPostId: '',
      });
    }
    else {
      linkVar({
        sourcePostId: props.card.postId,
        targetPostId: '', 
      })
    }
  }

  const handleMouseEnter = (event: React.MouseEvent) => {
    if (linkDetail.sourcePostId && linkDetail.sourcePostId !== props.card.postId) {
      linkVar({
        ...linkDetail,
        targetPostId: props.card.postId,
      });
    }
  }

  const handleMouseLeave = (event: React.MouseEvent) => {
    if (linkDetail.sourcePostId && linkDetail.sourcePostId !== props.card.postId) {
      linkVar({
        ...linkDetail,
        targetPostId: '',
      });
    }
  }

  const handleClick = (event: React.MouseEvent) => {
    if (linkDetail.sourcePostId === props.card.postId) {
      linkVar({
        sourcePostId: '',
        targetPostId: '',
      })
    }
    if (linkDetail.sourcePostId && linkDetail.targetPostId === props.card.postId) {
      linkPosts();
    }
  }

  const handleVoteClick = (clicks: number) => (event: React.MouseEvent) => {
    if (props.card.linkId) {
      votePosts(props.card.linkId, clicks);
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
    navigator.clipboard.writeText(`https://jamn.io/p/${props.card.postId}`);
    handleMenuClose();
  }

  const handleOpenClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    changeCol(props.colUnit.col, `/p/${props.card.postId}`)
  }

  const handlePromoteClick = (event: React.MouseEvent) => { 
    event.stopPropagation();

    if (props.post && props.post.id !== props.card.postId) {
      const post = client.cache.readFragment({
        id: client.cache.identify({
          id: props.card.postId,
          __typename: 'Post',
        }),
        fragment: POST_FIELDS,
      }) as Post;
      if (post.startI === 1) {
        changeCol(props.colUnit.col, `/start`);
      }
      else {
        changeCol(props.colUnit.col, `/p/${props.card.postId}`)
      }
    }
    const { idToCard, rootCard } = promoteCard(state, props.card);

    dispatch({
      type: 'MERGE_ITEMS',
      idToCard,
    });

    const stack = props.surveyorState.stack.slice();
    stack.push({
      originalQuery: '',
      query: '',
      cardIds: [rootCard.id],
    });
    props.setSurveyorState({
      ...props.surveyorState,
      stack,
      index: props.surveyorState.index + 1,
      triggerRefinement: false,
    });
  }

  const handleSubClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    subPost(props.card.postId);
  }
  
  const handleUnsubClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    unsubPost();
  }


  const post = client.cache.readFragment({
    id: client.cache.identify({
      id: props.card.postId,
      __typename: 'Post',
    }),
    fragment: FULL_POST_FIELDS,
    fragmentName: 'FullPostFields',
  }) as Post;

  if (!post) return null;

  const link = props.card.linkId
  ? client.cache.readFragment({
      id: client.cache.identify({
        id: props.card.linkId,
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
  else if (props.card.linkId) {
    console.error('Missing link', props.card.linkId)
  }

  const color = getColor(paletteDetail.mode);

  const isLinking = (
    linkDetail.sourcePostId === props.card.postId || 
    linkDetail.targetPostId === props.card.postId
  );

  const subbed = userDetail?.subs.some(sub => sub.postId === props.card.postId);
  
  const slice = props.surveyorState.stack[props.surveyorState.index];
  return (
    <MUICard elevation={5} 
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
        cursor: linkDetail.sourcePostId && linkDetail.sourcePostId !== props.card.postId
          ? 'crosshair'
          : '', 
        border: post.userId === userDetail?.id 
          ? `1px solid ${userDetail.color}`
          : null,
      }}
    >
      <PostComponent
        colUnit={props.colUnit}
        post={post}
        cardId={props.card.id}
      />
      <Box sx={{
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
      }}>
        {
          link 
            ? <MUICard variant='outlined' sx={{
                marginBottom: '8px',
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
                    padding: '2px',
                  }}
                >
                  { 
                    (userVote?.weight || 0) > 0
                      ? <ControlPointIcon fontSize='inherit' />
                      : <AddIcon fontSize='inherit' />
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
                    padding: '2px',
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
                    padding: '2px',
                  }}
                >
                  { 
                    (userVote?.weight || 0) < 0
                      ? <RemoveCircleOutlineIcon fontSize='inherit' />
                      : <RemoveIcon fontSize='inherit' />
                  }
                </Button>
              </MUICard>
            : null
        }
        <Box sx={{ 
          padding: '5px', 
          marginTop: '-5px',
          whiteSpace: 'nowrap',
        }}>
          <Box component='span' sx={{whiteSpace: 'nowrap'}}>
            &nbsp;&nbsp;
            <IconButton
              title='Reply to this post'
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
              title='Link from this post to another'
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
              title='More options...'
              onClick={handleMenuOpenClick}
              size='small'
              color='inherit'
              sx={{
                fontSize: 14,
                color: subbed
                  ? userDetail?.color
                  : color,
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
                subbed
                  ? <MenuItem onClick={handleUnsubClick} sx={{
                      fontSize: 14,
                    }}>
                      <Box sx={{
                        marginLeft: '-5px',
                        marginBottom: '-5px',
                        fontSize: 14,
                        color: userDetail?.color, 
                      }}>
                        <NotificationsTwoToneIcon fontSize='inherit'/>
                      </Box>
                      &nbsp; Unsubscribe from post
                    </MenuItem>
                  : <MenuItem onClick={handleSubClick} sx={{
                      fontSize: 14,
                    }}>
                      <Box sx={{
                        marginLeft: '-5px',
                        marginBottom: '-5px',
                        fontSize: 14,
                      }}>
                        <NotificationsNoneIcon fontSize='inherit'/>
                      </Box>
                      &nbsp; Subscribe to post
                    </MenuItem>
              }

              {
                props.depth !== 0 || slice.cardIds.length !== 1
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
          marginTop: '-2px',
          whiteSpace: 'nowrap',
        }}>
          <Button 
            onClick={handlePrevClick}
            color='inherit'
            size='small'
            variant={props.card.showPrev ? 'outlined' : 'text'}
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
            variant={props.card.showNext ? 'outlined' : 'text'}
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
    </MUICard>
  )
}