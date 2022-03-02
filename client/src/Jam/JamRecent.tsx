import { gql, useMutation } from '@apollo/client';
import { Box, Link } from '@mui/material';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { ItemContext } from '../App';
import { FULL_POST_FIELDS } from '../fragments';
import Surveyor from '../Surveyor/Surveyor';
import { ColUnit } from '../types/Col';
import { Jam } from '../types/Jam';
import { Post } from '../types/Post';
import { SurveyorSlice, SurveyorState } from '../types/Surveyor';
import { v4 as uuidv4 } from 'uuid';
import { Item, ItemState } from '../types/Item';
import Loading from '../Loading';

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

  const [isLoading, setIsLoading] = useState(false);
  const [nearTop, setNearTop] = useState(false);

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

  useEffect(() => {
    if (surveyorState.scrollToBottom && containerEl.current) {
      const slice = surveyorState.stack[surveyorState.index];
      if (slice.itemIds.length) {
        containerEl.current.scrollTo({
          top: containerEl.current.clientHeight,
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
            parentId: '',
            linkId: '',
            postId: post.id,
            showNext: false,
            showPrev: false,
            nextIds: [],
            prevIds: [],
            refresh: false,
          };
          idToItem[item.id] = item;
          itemIds.push(item.id);
        }
      });

      dispatch({
        type: 'ADD_ITEMS',
        idToItem,
      });

      const surveyorSlice: SurveyorSlice = {
        ...slice,
        itemIds: [...itemIds.reverse(), ...slice.itemIds]
      };

      const stack = surveyorState.stack.slice();
      stack.splice(surveyorState.index, 1, surveyorSlice);

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
        if (containerEl.current?.scrollTop)
        if ((containerEl.current?.scrollTop || 300) < 300) {
          setNearTop(true);
        }
      });
    }
  }, [])

  useEffect(() => {
    if (nearTop) {
      setNearTop(false);
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
  }, [nearTop]);

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
                  <Link onClick={handleLoadMoreClick}>
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