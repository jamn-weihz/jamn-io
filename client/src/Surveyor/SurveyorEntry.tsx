import { Box, Button, Card as MUICard, IconButton, Tooltip} from '@mui/material';
import NorthIcon from '@mui/icons-material/North';
import ReplyIcon from '@mui/icons-material/Reply';
import DoubleArrowIcon from '@mui/icons-material/DoubleArrow';
import FilterAltTwoToneIcon from '@mui/icons-material/FilterAltTwoTone';
import NotificationsTwoToneIcon from '@mui/icons-material/NotificationsTwoTone';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import { surveyorVar, userVar } from '../cache';
import { gql, useReactiveVar } from '@apollo/client';
import { Post } from '../types/Post';
import { User } from '../types/User';
import { useApolloClient } from '@apollo/client';
import React, { Dispatch } from 'react';
import { Role } from '../types/Role';
import { v4 as uuidv4 } from 'uuid'; 
import { Link } from '../types/Link';
import { useSearchParams } from 'react-router-dom';
import { SurveyorItem } from '../types/Surveyor';
import PostComponent from '../Post/Post';
import useReplyPost from '../Post/useReplyPost';
import { Jam } from '../types/Jam';

interface SurveyorEntryProps {
  context: User | Jam;
  post: Post;
  showPrev: boolean;
  showNext: boolean;
  item: SurveyorItem;
  updateItem(item: SurveyorItem): void;
  depth: number;
}

export default function SurveyorEntry(props: SurveyorEntryProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  const client = useApolloClient();
  const userDetail = useReactiveVar(userVar);
  const surveyorDetail = useReactiveVar(surveyorVar);

  const surveyorState = surveyorDetail[props.context.id]

  const handleReplyCompleted = (link: Link) => {
    const newItem = {
      link,
      post: link.targetPost,
      showPrev: false,
      showNext: true,
      prev: [],
      next: [],
      refresh: false,
      instanceId: uuidv4(),
    };
    props.updateItem({
      ...props.item,
      showPrev: false,
      showNext: true,
      next: [newItem, ...props.item.next]
    })
  }

  const { replyPost } = useReplyPost(props.post.id, props.context, handleReplyCompleted);

  const handlePrevClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (props.item.showPrev) {
      props.updateItem({
        ...props.item,
        showPrev: false,
      })
    }
    else {
      props.updateItem({
        ...props.item,
        showPrev: true,
        showNext: false,
        refresh: true,
      })
    }
  }

  const handleNextClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (props.item.showNext) {
      props.updateItem({
        ...props.item,
        showNext: false,
      })
    }
    else {
      props.updateItem({
        ...props.item,
        showPrev: false,
        showNext: true,
        refresh: true,
      })
    }
  }
  
  const handlePromoteClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    const stack = surveyorState.stack.slice();
    stack.push({
      originalQuery: '',
      query:'',
      items: [{
        ...props.item,
        link: undefined,
      }]
    });
    surveyorVar({
      ...surveyorDetail,
      [props.context.id]: {
        ...surveyorState,
        index: surveyorState.index + 1,
        stack,
        scrollToTop: true,
      },
    });
  }

  const handleReplyClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
  }

  const handleLinkClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
  }

  const handleMouseEnter = (event: React.MouseEvent) => {
  }

  const handleMouseLeave = (event: React.MouseEvent) => {
  }

  const handleClick = (event: React.MouseEvent) => {
  }

  const handleFilterClick = (event: React.MouseEvent) => {

  }

  const handleSubscribeClick = (isSubcribed: boolean) =>  (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
  }

  return (
    <MUICard elevation={7} 
      onMouseEnter={handleMouseEnter} 
      onMouseLeave={handleMouseLeave} 
      onClick={handleClick}
      sx={{
        margin: '5px',
        width: 'calc(100% - 10px)',
      }}
    >
      <PostComponent
        post={props.item.post}
        instanceId={props.item.instanceId}
      />
      <Box sx={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
      }}>
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
          <Box sx={{margin: 'auto', padding: '5px', marginTop: '-4px'}}>
            <IconButton
              disabled={props.depth === 0 && surveyorState.stack[surveyorState.index].items.length === 1}
              size='small'
              onClick={handlePromoteClick}
              sx={{
                fontSize: 14,
                color: 'dimgrey',
              }}
            >
              <NorthIcon fontSize='inherit' />
            </IconButton>
            &nbsp;
            &nbsp;
            <Box component='span' sx={{whiteSpace: 'nowrap'}}>
              <IconButton
                disabled={!userDetail.user?.verifyEmailDate}
                size='small'
                color='inherit'
                onClick={handleReplyClick}
                sx={{
                  fontSize: 14,
                  color: 'dimgrey'
                }}
              >
                <ReplyIcon fontSize='inherit'/>
              </IconButton>
              &nbsp;
              &nbsp;
              <IconButton
                disabled={!userDetail.user?.verifyEmailDate}
                size='small'
                color='inherit'
                onClick={handleLinkClick}
                sx={{
                  fontSize: 14,
                  color: 'dimgrey'
                }}
              >
                <DoubleArrowIcon fontSize='inherit'/>
              </IconButton>
            </Box>
          </Box>
        </Box>
        &nbsp;&nbsp;&nbsp;
        <Box sx={{
          color: 'dimgrey',
          fontSize: 12,
          paddingBottom: '3px'
        }}>
          <Button 
            onClick={handlePrevClick}
            color='inherit'
            size='small'
            variant={props.showPrev ? 'outlined' : 'text'}
            sx={{
              fontSize: 12,
            }}
          >
            {props.item.post.prevCount} prev
          </Button>
          &nbsp;
          <Button 
            onClick={handleNextClick}
            color='inherit'
            size='small'
            variant={props.showNext ? 'outlined' : 'text'}
            sx={{
              fontSize: 12,
            }}
          >
            {props.item.post.nextCount} next
          </Button>
        </Box>
      </Box>
    </MUICard>
  )
}