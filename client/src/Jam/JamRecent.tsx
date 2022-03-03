import { gql, useApolloClient, useMutation } from '@apollo/client';
import { Box, Link } from '@mui/material';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { ItemContext, PostContext } from '../App';
import { FULL_POST_FIELDS } from '../fragments';
import Surveyor from '../Item/ItemSurveyor';
import { ColUnit } from '../types/Col';
import { Jam } from '../types/Jam';
import { Post } from '../types/Post';
import { SurveyorSlice, SurveyorState } from '../types/Surveyor';
import { v4 as uuidv4 } from 'uuid';
import { Item, ItemState } from '../types/Item';
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
  const { state, dispatch } = useContext(ItemContext);

  const client = useApolloClient();

  const [isLoading, setIsLoading] = useState(false);
  const [scrollTop, setScrollTop] = useState(0);
  const [hasScrolledUp, setHasScrolledUp] = useState(false);

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

  const containerEl = useRef<HTMLElement>();

  useJamPostSubscription(props.jam.id, (post: Post) => {
    const item: Item = {
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
      isRootRecentUserVoteItem: false,
    };
    dispatch({
      type: 'MERGE_ITEMS',
      idToItem: {
        [item.id]: item,
      },
    });
    const slice = surveyorState.stack[surveyorState.index];

    const stack = surveyorState.stack.slice();
    stack.splice(surveyorState.index, 1, {
      ...slice,
      itemIds: [...slice.itemIds, item.id],
    });

    setSurveyorState({
      ...surveyorState,
      stack,
    })
  });

  useEffect(() => {
    if (surveyorState.scrollToBottom && containerEl.current) {
      const slice = surveyorState.stack[surveyorState.index];
      if (slice.itemIds.length) {
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

      const itemIds: string[] = [];
      const idToItem: ItemState = {};
      data.getRecentJamPosts.forEach((post: Post) => {
        let itemId;
        slice.itemIds.some(id => {
          if (state[id].postId === post.id) {
            itemId = id;
            return true;
          }
          return false;
        });
        if (itemId) {
          itemIds.push(itemId)
        }
        else {
          const item: Item = {
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
            isRootRecentUserVoteItem: false
          };
          idToItem[item.id] = item;
          itemIds.push(item.id);
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
        const remaining = props.jam.postI - slice.itemIds.length;
        if (remaining > 0) {
          setIsLoading(true);
          getRecent({
            variables: {
              jamId: props.jam.id,
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

  useEffect(() => {
    const slice = surveyorState.stack[surveyorState.index];

    let hasNewlySaved = slice.itemIds.some(itemId => {
      return state[itemId].isNewlySaved;
    })

    const itemIds = slice.itemIds.slice().sort((a, b) => {
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

    const hasDiff = itemIds.some((id, i) => {
      return id !== slice.itemIds[i];
    });

    if (hasDiff) {
      const stack = surveyorState.stack.slice();
      stack.splice(surveyorState.index, 1, {
        ...slice,
        itemIds,
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
          offset: slice.itemIds.length,
        }
      })
    }
  }

  if (!surveyorState) return null;

  const slice = surveyorState.stack[surveyorState.index];

  const remaining = props.jam.postI - slice.itemIds.length
  return (
    <Box ref={containerEl} sx={{
      height: 'calc(100% - 90px)',
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
        jam={props.jam}
        hideOpaquePosts={false}
      />
    </Box>
  );
}