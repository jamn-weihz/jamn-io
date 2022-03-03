import { gql, useMutation, useReactiveVar } from '@apollo/client';
import { Box, Link } from '@mui/material';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { ItemContext } from '../App';
import Surveyor from '../Item/ItemSurveyor';
import Loading from '../Loading';
import { ColUnit } from '../types/Col';
import { Item, ItemState } from '../types/Item';
import { SurveyorSlice, SurveyorState } from '../types/Surveyor';
import { User } from '../types/User';
import { Vote } from '../types/Vote';
import {v4 as uuidv4 } from 'uuid';
import { FULL_VOTE_FIELDS } from '../fragments';
import { userVar } from '../cache';
import userUserVoteSubscription from './useUserVoteSubscription';

const GET_RECENT_USER_VOTES = gql`
  mutation GetRecentUserVotes($userId: String!, $offset: Int!) {
    getRecentUserVotes(userId: $userId, offset: $offset) {
      ...FullVoteFields
    }
  }
  ${FULL_VOTE_FIELDS}
`;

interface UserRecentProps {
  user: User;
  colUnit: ColUnit;
}

export default function UserRecent(props: UserRecentProps) {
  const { state, dispatch } = useContext(ItemContext);

  const userDetail = useReactiveVar(userVar);

  const [surveyorState, setSurveyorState] = useState({
    index: 0,
    stack: [{
      originalQuery: '',
      query: '',
      itemIds: [],
    }],
    reload: false,
    triggerRefinement: false,
    scrollToTop: false,
    scrollToBottom: true,
  } as SurveyorState);

  const [isLoading, setIsLoading] = useState(false);
  const [scrollTop, setScrollTop] = useState(0);
  const [hasScrolledUp, setHasScrolledUp] = useState(false);
  const containerEl = useRef<HTMLElement>();

  userUserVoteSubscription(props.user.id, (vote: Vote) => {
    const slice = surveyorState.stack[surveyorState.index];

    let itemId = '';
    slice.itemIds.some(id => {
      if (state[id].postId === vote.sourcePostId) {
        const hasTargetPost = state[id].nextIds.some(nextId => {
          return state[nextId].postId === vote.targetPostId;
        })
        if (hasTargetPost) {
          itemId = id;
          return true;
        }
      }
      return false;
    });

    if (itemId) {
      const stack = surveyorState.stack.slice();
      stack.splice(surveyorState.index, 1, {
        ...slice,
        itemIds: [...slice.itemIds.filter(id => id !== itemId), itemId],
      });
      setSurveyorState({
        ...surveyorState,
        stack,
      });
    }
    else {
      const targetItem: Item = {
        id: uuidv4(),
        userId: vote.targetPost.userId,
        parentId: '',
        linkId: vote.linkId,
        postId: vote.targetPostId,
        showNext: false,
        showPrev: false,
        nextIds: [],
        prevIds: [],
        isNewlySaved: false,
        refreshPost: false,
        getLinks: false,
        isRootRecentUserVoteItem: false,
      };
      const sourceItem: Item = {
        id: uuidv4(),
        userId: vote.sourcePost.userId,
        parentId: '',
        linkId: '',
        postId: vote.sourcePostId,
        showNext: true,
        showPrev: false,
        nextIds: [targetItem.id],
        prevIds: [],
        isNewlySaved: false,
        refreshPost: false,
        getLinks: false,
        isRootRecentUserVoteItem: true,
      };
      dispatch({
        type: 'MERGE_ITEMS',
        idToItem: {
          [sourceItem.id]: sourceItem,
          [targetItem.id]: targetItem,
        },
      });

      const stack = surveyorState.stack.slice();
      stack.splice(surveyorState.index, 1, {
        ...slice,
        itemIds: [...slice.itemIds, sourceItem.id],
      });
      setSurveyorState({
        ...surveyorState,
        stack,
      });
    }
  })

  const [getRecent] = useMutation(GET_RECENT_USER_VOTES, {
    onError: error => {
      console.error(error);
    },
    onCompleted: data => {
      console.log(data);
      setIsLoading(false);

      const slice = surveyorState.stack[surveyorState.index];

      const itemIds: string[] = [];
      const idToItem: ItemState = {};
      data.getRecentUserVotes.forEach((vote: Vote) => {
        let itemId;
        slice.itemIds.some(id => {
          if (state[id].postId === vote.sourcePostId) {
            const hasTargetPost = state[id].nextIds.some(nextId => {
              return state[nextId].postId === vote.targetPostId;
            })
            if (hasTargetPost) {
              itemId = id;
              return true;
            }
          }
          return false;
        });
        if (itemId) {
          itemIds.push(itemId)
        }
        else {
          const targetItem: Item = {
            id: uuidv4(),
            userId: vote.targetPost.userId,
            parentId: '',
            linkId: vote.linkId,
            postId: vote.targetPostId,
            showNext: false,
            showPrev: false,
            nextIds: [],
            prevIds: [],
            isNewlySaved: false,
            refreshPost: false,
            getLinks: false,
            isRootRecentUserVoteItem: false,
          };
          const sourceItem: Item = {
            id: uuidv4(),
            userId: vote.sourcePost.userId,
            parentId: '',
            linkId: '',
            postId: vote.sourcePostId,
            showNext: true,
            showPrev: false,
            nextIds: [targetItem.id],
            prevIds: [],
            isNewlySaved: false,
            refreshPost: false,
            getLinks: false,
            isRootRecentUserVoteItem: true,
          };
          idToItem[sourceItem.id] = sourceItem;
          idToItem[targetItem.id] = targetItem;
          itemIds.push(sourceItem.id);
        }
      });

      dispatch({
        type: 'MERGE_ITEMS',
        idToItem,
      });

      const stack = surveyorState.stack.slice();
      stack.splice(surveyorState.index, 1, {
        ...slice,
        itemIds: [...itemIds.reverse(), ...slice.itemIds]
      });

      setSurveyorState({
        ...surveyorState,
        stack,
      });
    },
  });

  useEffect(() => {
    setIsLoading(true);
    getRecent({
      variables: {
        userId: props.user.id,
        offset: 0,
      }
    });
    if (containerEl.current) {
      containerEl.current.addEventListener('scroll', event => {
        if (containerEl.current?.scrollTop !== undefined) {
          setScrollTop(top => {
            if (containerEl.current?.scrollTop !== undefined) {
              if (containerEl.current?.scrollTop < top) {
                setHasScrolledUp(true);
              }
              return containerEl.current?.scrollTop
            }
            return 0;
          })
        }
      });
    }
  }, []);

  useEffect(() => {
    if (scrollTop < 500) {
      if (!isLoading) {
        const slice = surveyorState.stack[surveyorState.index];
        const remaining = props.user.voteI - slice.itemIds.length;
        if (remaining > 0) {
          setIsLoading(true);
          getRecent({
            variables: {
              userId: props.user.id,
              offset: slice.itemIds.length,
            }
          });
        }
      }
    }
  }, [scrollTop]);

  useEffect(() => {
    if (!hasScrolledUp && containerEl.current) {
      containerEl.current.scrollTo({
        top: containerEl.current.scrollHeight,
        behavior: 'smooth',
      })
    }
  }, [containerEl.current?.scrollHeight]);

  const handleLoadMoreClick = (event: React.MouseEvent) => {
    if (!isLoading) {
      const slice = surveyorState.stack[surveyorState.index];
      setIsLoading(true);
      getRecent({
        variables: {
          userId: props.user.id,
          offset: slice.itemIds.length,
        }
      })
    }
  }

  const slice = surveyorState.stack[surveyorState.index];
  const remaining = props.user.voteI - slice.itemIds.length;

  return (
    <Box ref={containerEl} sx={{
      height: userDetail?.id === props.user.id
        ? 'calc(100% - 130px)'
        : 'calc(100% - 90px)',
      overflow: 'scroll',
    }}>
      <Box sx={{
        margin: 1,
      }}>
        {
          isLoading 
            ? <Loading />
            : remaining > 0
              ? <Box>
                  <Link onClick={handleLoadMoreClick} sx={{
                    cursor: 'pointer',
                  }}>
                    { remaining } more
                  </Link>
                </Box>
              : null
        }
      </Box>
      <Surveyor
        key={`surveyor-${props.colUnit.col.id}`}
        colUnit={props.colUnit}
        surveyorState={surveyorState}
        setSurveyorState={setSurveyorState}
        hideOpaquePosts={false}
      />
    </Box>
  );
}