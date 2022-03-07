import { gql, useApolloClient, useMutation } from '@apollo/client';
import { Box, Link } from '@mui/material';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { CardContext, PostContext } from '../App';
import { FULL_POST_FIELDS } from '../fragments';
import Surveyor from '../Card/CardSurveyor';
import { ColUnit } from '../types/Col';
import { Jam } from '../types/Jam';
import { Post } from '../types/Post';
import { SurveyorSlice, SurveyorState } from '../types/Surveyor';
import { v4 as uuidv4 } from 'uuid';
import { Card, CardState } from '../types/Card';
import Loading from '../Loading';
import useJamPostSubscription from './useJamPostSubscription';

const GET_RECENT_JAM_POSTS = gql`
  mutation GetRecentJamPosts($jamId: String!, $offset: Int!) {
    getRecentJamPosts(jamId: $jamId, offset: $offset) {
      ...FullPostFields
    } 
  }
  ${FULL_POST_FIELDS}
`;

interface JamRecentProps {
  jam: Jam;
  colUnit: ColUnit;
}
export default function JamRecent(props: JamRecentProps) {
  const { state, dispatch } = useContext(CardContext);

  const client = useApolloClient();

  const [isLoading, setIsLoading] = useState(false);
  const [scrollTop, setScrollTop] = useState(0);
  const [hasScrolledUp, setHasScrolledUp] = useState(false);

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

  const containerEl = useRef<HTMLElement>();

  useJamPostSubscription(props.jam.id, (post: Post) => {
    const card: Card = {
      id: uuidv4(),
      userId: post.userId,
      parentId: '',
      linkId: '',
      postId: post.id,
      showNext: false,
      showPrev: false,
      nextIds: [],
      prevIds: [],
      isNewlySaved: false,
      refreshPost: false,
      getLinks: false,
      isRootRecentUserVoteCard: false,
    };
    dispatch({
      type: 'MERGE_ITEMS',
      idToCard: {
        [card.id]: card,
      },
    });
    const slice = surveyorState.stack[surveyorState.index];

    const stack = surveyorState.stack.slice();
    stack.splice(surveyorState.index, 1, {
      ...slice,
      cardIds: [...slice.cardIds, card.id],
    });

    setSurveyorState({
      ...surveyorState,
      stack,
    })
  });

  useEffect(() => {
    if (surveyorState.scrollToBottom && containerEl.current) {
      const slice = surveyorState.stack[surveyorState.index];
      if (slice.cardIds.length) {
        containerEl.current.scrollTo({
          top: containerEl.current.scrollHeight,
          behavior: 'smooth',
        });
        setSurveyorState({
          ...surveyorState,
          scrollToBottom: false,
        })
      }
    }
  }, [surveyorState])

  const [getRecent] = useMutation(GET_RECENT_JAM_POSTS, {
    onError: error => {
      console.error(error);
    },
    onCompleted: data => {
      console.log(data);
      setIsLoading(false);

      const slice = surveyorState.stack[surveyorState.index];

      const cardIds: string[] = [];
      const idToCard: CardState = {};
      data.getRecentJamPosts.forEach((post: Post) => {
        let cardId;
        slice.cardIds.some(id => {
          if (state[id].postId === post.id) {
            cardId = id;
            return true;
          }
          return false;
        });
        if (cardId) {
          cardIds.push(cardId)
        }
        else {
          const card: Card = {
            id: uuidv4(),
            userId: post.userId,
            parentId: '',
            linkId: '',
            postId: post.id,
            showNext: false,
            showPrev: false,
            nextIds: [],
            prevIds: [],
            isNewlySaved: false,
            refreshPost: false,
            getLinks: false,
            isRootRecentUserVoteCard: false
          };
          idToCard[card.id] = card;
          cardIds.push(card.id);
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
      })
    },
  });

  
  useEffect(() => {
    setIsLoading(true);
    getRecent({
      variables: {
        jamId: props.jam.id,
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
  }, [])

  useEffect(() => {
    if (scrollTop < 500) {
      if (!isLoading) {
        const slice = surveyorState.stack[surveyorState.index];
        const remaining = props.jam.postI - slice.cardIds.length;
        if (remaining > 0) {
          setIsLoading(true);
          getRecent({
            variables: {
              jamId: props.jam.id,
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

  useEffect(() => {
    const slice = surveyorState.stack[surveyorState.index];

    let hasNewlySaved = slice.cardIds.some(cardId => {
      return state[cardId].isNewlySaved;
    })

    const cardIds = slice.cardIds.slice().sort((a, b) => {
      const postA = client.cache.readFragment({
        id: client.cache.identify({
          id: state[a].postId,
          __typename: 'Post',
        }),
        fragment: gql`
          fragment PostWithSaveDate on Post {
            id
            saveDate
          }
        `,
      }) as Post;

      const postB = client.cache.readFragment({
        id: client.cache.identify({
          id: state[b].postId,
          __typename: 'Post',
        }),
        fragment: gql`
          fragment PostWithSaveDate on Post {
            id
            saveDate
          }
        `,
      }) as Post;

      return postA.saveDate < postB.saveDate ? -1 : 1;
    });

    const hasDiff = cardIds.some((id, i) => {
      return id !== slice.cardIds[i];
    });

    if (hasDiff) {
      const stack = surveyorState.stack.slice();
      stack.splice(surveyorState.index, 1, {
        ...slice,
        cardIds,
      });
      setSurveyorState({
        ...surveyorState,
        stack,
      });
    }
    if (hasNewlySaved && containerEl.current) {
      containerEl.current.scrollTo({
        top: containerEl.current.scrollHeight,
        behavior: 'smooth',
      })
    }
  }, [state])

  const handleLoadMoreClick = (event: React.MouseEvent) => {
    if (!isLoading) {
      const slice = surveyorState.stack[surveyorState.index];
      setIsLoading(true);
      getRecent({
        variables: {
          jamId: props.jam.id,
          offset: slice.cardIds.length,
        }
      })
    }
  }

  if (!surveyorState) return null;

  const slice = surveyorState.stack[surveyorState.index];

  const remaining = props.jam.postI - slice.cardIds.length
  return (
    <Box ref={containerEl} sx={{
      height: 'calc(100% - 90px)',
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
        jam={props.jam}
        hideOpaquePosts={false}
      />
    </Box>
  );
}