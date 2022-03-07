import { gql, useMutation, useReactiveVar } from '@apollo/client';
import { Box, Link } from '@mui/material';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { CardContext } from '../App';
import Surveyor from '../Card/CardSurveyor';
import Loading from '../Loading';
import { ColUnit } from '../types/Col';
import { Card, CardState } from '../types/Card';
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
  const { state, dispatch } = useContext(CardContext);

  const userDetail = useReactiveVar(userVar);

  const [surveyorState, setSurveyorState] = useState({
    index: 0,
    stack: [{
      originalQuery: '',
      query: '',
      cardIds: [],
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

    let cardId = '';
    slice.cardIds.some(id => {
      if (state[id].postId === vote.sourcePostId) {
        const hasTargetPost = state[id].nextIds.some(nextId => {
          return state[nextId].postId === vote.targetPostId;
        })
        if (hasTargetPost) {
          cardId = id;
          return true;
        }
      }
      return false;
    });

    if (cardId) {
      const stack = surveyorState.stack.slice();
      stack.splice(surveyorState.index, 1, {
        ...slice,
        cardIds: [...slice.cardIds.filter(id => id !== cardId), cardId],
      });
      setSurveyorState({
        ...surveyorState,
        stack,
      });
    }
    else {
      const targetCard: Card = {
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
        isRootRecentUserVoteCard: false,
      };
      const sourceCard: Card = {
        id: uuidv4(),
        userId: vote.sourcePost.userId,
        parentId: '',
        linkId: '',
        postId: vote.sourcePostId,
        showNext: true,
        showPrev: false,
        nextIds: [targetCard.id],
        prevIds: [],
        isNewlySaved: false,
        refreshPost: false,
        getLinks: false,
        isRootRecentUserVoteCard: true,
      };
      dispatch({
        type: 'MERGE_ITEMS',
        idToCard: {
          [sourceCard.id]: sourceCard,
          [targetCard.id]: targetCard,
        },
      });

      const stack = surveyorState.stack.slice();
      stack.splice(surveyorState.index, 1, {
        ...slice,
        cardIds: [...slice.cardIds, sourceCard.id],
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

      const cardIds: string[] = [];
      const idToCard: CardState = {};
      data.getRecentUserVotes.forEach((vote: Vote) => {
        let cardId;
        slice.cardIds.some(id => {
          if (state[id].postId === vote.sourcePostId) {
            const hasTargetPost = state[id].nextIds.some(nextId => {
              return state[nextId].postId === vote.targetPostId;
            })
            if (hasTargetPost) {
              cardId = id;
              return true;
            }
          }
          return false;
        });
        if (cardId) {
          cardIds.push(cardId)
        }
        else {
          const targetCard: Card = {
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
            isRootRecentUserVoteCard: false,
          };
          const sourceCard: Card = {
            id: uuidv4(),
            userId: vote.sourcePost.userId,
            parentId: '',
            linkId: '',
            postId: vote.sourcePostId,
            showNext: true,
            showPrev: false,
            nextIds: [targetCard.id],
            prevIds: [],
            isNewlySaved: false,
            refreshPost: false,
            getLinks: false,
            isRootRecentUserVoteCard: true,
          };
          idToCard[sourceCard.id] = sourceCard;
          idToCard[targetCard.id] = targetCard;
          cardIds.push(sourceCard.id);
        }
      });

      dispatch({
        type: 'MERGE_ITEMS',
        idToCard,
      });

      const stack = surveyorState.stack.slice();
      stack.splice(surveyorState.index, 1, {
        ...slice,
        cardIds: [...cardIds.reverse(), ...slice.cardIds]
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
        const remaining = props.user.voteI - slice.cardIds.length;
        if (remaining > 0) {
          setIsLoading(true);
          getRecent({
            variables: {
              userId: props.user.id,
              offset: slice.cardIds.length,
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
          offset: slice.cardIds.length,
        }
      })
    }
  }

  const slice = surveyorState.stack[surveyorState.index];
  const remaining = props.user.voteI - slice.cardIds.length;

  return (
    <Box ref={containerEl} sx={{
      height: userDetail?.id === props.user.id
        ? 'calc(100% - 150px)'
        : 'calc(100% - 110px)',
      overflowY: 'scroll',
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