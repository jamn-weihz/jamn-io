import { Box, Button, Card as MUICard, IconButton } from '@mui/material';
import NorthIcon from '@mui/icons-material/North';
import ReplyIcon from '@mui/icons-material/Reply';
import DoubleArrowIcon from '@mui/icons-material/DoubleArrow';
import FilterAltTwoToneIcon from '@mui/icons-material/FilterAltTwoTone';
import NotificationsTwoToneIcon from '@mui/icons-material/NotificationsTwoTone';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import { linkVar, surveyorVar, userVar } from '../cache';
import { useReactiveVar } from '@apollo/client';
import { Post, PostAction } from '../types/Post';
import { useApolloClient } from '@apollo/client';
import React, { Dispatch, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid'; 
import { Link } from '../types/Link';
import { useSearchParams } from 'react-router-dom';
import { SurveyorItem } from '../types/Surveyor';
import PostComponent from '../Post/Post';
import useReplyPost from '../Post/useReplyPost';
import { Jam } from '../types/Jam';
import { FULL_POST_FIELDS, LINK_FIELDS } from '../fragments';
import useGetPrev from '../Post/useGetPrev';
import useGetNext from '../Post/useGetNext';
import { Col } from '../types/Col';
import useLinkPosts from '../Post/useLinkPosts';

interface SurveyorEntryProps {
  jam?: Jam;
  col: Col;
  item: SurveyorItem;
  updateItem(item: SurveyorItem): void;
  depth: number;
  postDispatch: Dispatch<PostAction>;
}

export default function SurveyorEntry(props: SurveyorEntryProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  const client = useApolloClient();
  const userDetail = useReactiveVar(userVar);
  const surveyorDetail = useReactiveVar(surveyorVar);
  const linkDetail = useReactiveVar(linkVar);  

  const { linkPosts } = useLinkPosts();

  const surveyorState = surveyorDetail[props.col.id]

  const handleGetPrevCompleted = (inLinks: Link[]) => {
    const items = inLinks.map(link => {
      let existingItem = null as SurveyorItem | null;
      props.item.prev.some(item => {
        if (item.linkId === link.id) {
          existingItem = item;
          return true;
        }
        return false;
      });
      return {
        linkId: link.id,
        postId: link.sourcePostId,
        postKey: uuidv4(),
        showPrev: !!existingItem?.showPrev,
        showNext: !!existingItem?.showNext,
        prev: existingItem?.prev || [],
        next: existingItem?.next || [],
        refresh: false,
      } as SurveyorItem;
    });
    props.updateItem({
      ...props.item,
      showPrev: true,
      showNext: false,
      prev: [...props.item.prev, ...items],
    });
  }
  const { getPrev } = useGetPrev(props.item.postId, handleGetPrevCompleted);

  const handleGetNextCompleted = (outLinks: Link[]) => {
    const items = outLinks.map(link => {
      let existingItem = null as SurveyorItem | null;
      props.item.prev.some(item => {
        if (item.linkId === link.id) {
          existingItem = item;
          return true;
        }
        return false;
      });
      return {
        linkId: link.id,
        postId: link.targetPostId,
        postKey: uuidv4(),
        showPrev: !!existingItem?.showPrev,
        showNext: !!existingItem?.showNext,
        prev: existingItem?.prev || [],
        next: existingItem?.next || [],
        refresh: false,
      } as SurveyorItem;
    });
    props.updateItem({
      ...props.item,
      showPrev: false,
      showNext: true,
      next: [...props.item.next, ...items],
      refresh: false,
    });
  }
  const { getNext } = useGetNext(props.item.postId, handleGetNextCompleted);

  const handleReplyCompleted = (link: Link) => {
    const newItem = {
      linkId: link.id,
      postId: link.targetPostId,
      postKey: uuidv4(),
      showPrev: false,
      showNext: true,
      prev: [],
      next: [],
      refresh: false,
    };
    props.updateItem({
      ...props.item,
      showPrev: false,
      showNext: true,
      next: [newItem, ...props.item.next],
      refresh: false,
    })
  }

  const { replyPost } = useReplyPost(props.item.postId, props.jam, handleReplyCompleted);

  useEffect(() => {
    if (props.item.refresh) {
      if (props.item.showNext) {
        getNext(0);
      }
      else if (props.item.showPrev) {
        getPrev(0);
      }
      props.updateItem({
        ...props.item,
        refresh: false,
      });
    }
  }, [props.item.refresh]);

  const handlePrevClick = (event: React.MouseEvent) => {
    if (props.item.showPrev) {
      props.updateItem({
        ...props.item,
        showPrev: false,
      })
    }
    else {
      getPrev(props.item.prev.length);
      props.updateItem({
        ...props.item,
        showPrev: true,
        showNext: false,
      });
    }
  }

  const handleNextClick = (event: React.MouseEvent) => {
    if (props.item.showNext) {
      props.updateItem({
        ...props.item,
        showNext: false,
      })
    }
    else {
      getNext(props.item.next.length);
      props.updateItem({
        ...props.item,
        showPrev: false,
        showNext: true,
      })
    }
  }
  
  const handlePromoteClick = (event: React.MouseEvent) => {
    const stack = surveyorState.stack.slice();
    stack.push({
      originalQuery: '',
      query:'',
      items: [{
        ...props.item,
        linkId: undefined,
      }]
    });
    surveyorVar({
      ...surveyorDetail,
      [props.col.id]: {
        ...surveyorState,
        index: surveyorState.index + 1,
        stack,
        scrollToTop: true,
      },
    });
  }

  const handleReplyClick = (event: React.MouseEvent) => {
    replyPost();
  }

  const handleLinkClick = (event: React.MouseEvent) => {
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
    if (linkDetail.sourcePostId && linkDetail.targetPostId === props.item.postId) {
      linkPosts();
    } 
  }

  const handleFilterClick = (event: React.MouseEvent) => {

  }

  const handleSubscribeClick = (isSubcribed: boolean) =>  (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
  }

  const post = client.cache.readFragment({
    id: client.cache.identify({
      id: props.item.postId,
      __typename: 'Post',
    }),
    fragment: FULL_POST_FIELDS,
    fragmentName: 'FullPostFields',
  }) as Post;

  const link = props.item.linkId
    ? client.cache.readFragment({
        id: client.cache.identify({
          id: props.item.linkId,
          __typename: 'Link',
        }),
        fragment: LINK_FIELDS,
      }) as Link
    : null;


  if (!post) return null;
  return (
    <MUICard elevation={5} 
      onMouseEnter={handleMouseEnter} 
      onMouseLeave={handleMouseLeave} 
      onClick={handleClick}
      sx={{
        margin: 1,
        marginBottom: 0,
        width: 'calc(100% - 10px)',
      }}
    >
      <PostComponent
        post={post}
        postKey={props.item.postKey}
        postDispatch={props.postDispatch}
      />
      <Box sx={{
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
      }}>
        {
          link 
            ? <Box sx={{
                color: 'dimgrey',
                paddingBottom: '5px'
              }}>
                <Button
                  color='inherit'
                  size='small'
                  sx={{
                    fontSize: 10,
                    minWidth: 0,
                  }}
                >
                  { link.weight > 0 ? '+' : ''}
                  { link.weight }
                </Button>
              </Box>
            : null
        }
        <Box sx={{ 
          padding: '5px', 
          marginTop: '-4px', 
          whiteSpace: 'nowrap',
        }}>
          <IconButton
            disabled={props.depth === 0 && surveyorState.stack[surveyorState.index].items.length === 1}
            size='small'
            onClick={handlePromoteClick}
            sx={{
              fontSize: 12,
              color: 'dimgrey',
            }}
          >
            <NorthIcon fontSize='inherit' />
          </IconButton>
          <Box component='span' sx={{whiteSpace: 'nowrap'}}>
            <IconButton
              disabled={!userDetail?.verifyEmailDate}
              size='small'
              color='inherit'
              onClick={handleReplyClick}
              sx={{
                fontSize: 12,
                color: 'dimgrey'
              }}
            >
              <ReplyIcon fontSize='inherit'/>
            </IconButton>
            <IconButton
              disabled={!userDetail?.verifyEmailDate}
              size='small'
              color='inherit'
              onClick={handleLinkClick}
              sx={{
                fontSize: 12,
                color: 'dimgrey'
              }}
            >
              <DoubleArrowIcon fontSize='inherit'/>
            </IconButton>
          </Box>
        </Box>
        <Box>
          
        </Box>
        <Box sx={{
          color: 'dimgrey',
          paddingBottom: '5px',
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
    </MUICard>
  )
}