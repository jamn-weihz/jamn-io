import { gql, useMutation } from '@apollo/client';
import { Box } from '@mui/material';
import { useContext, useEffect, useRef, useState } from 'react';
import { ItemContext } from '../App';
import { FULL_POST_FIELDS } from '../fragments';
import Surveyor from '../Surveyor/Surveyor';
import { ColUnit } from '../types/Col';
import { Jam } from '../types/Jam';
import { Post } from '../types/Post';
import { SurveyorSlice, SurveyorState } from '../types/Surveyor';
import { v4 as uuidv4 } from 'uuid';
import { Item, ItemState } from '../types/Item';

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

  const [surveyorState, setSurveyorState] = useState({
    index: 0,
    stack: [{
      originalQuery: '',
      query: '',
      itemIds: [],
    }],
    scrollToTop: false,
    reload: false,
    triggerRefinement: false,
  } as SurveyorState);

  const containerEl = useRef<HTMLElement>();

  const [getRecent] = useMutation(GET_RECENT_JAM_POSTS, {
    onError: error => {
      console.error(error);
    },
    onCompleted: data => {
      console.log(data);
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
    getRecent({
      variables: {
        jamId: props.jam.id,
        offset: 0,
      }
    });
  }, [])


  if (!surveyorState) return null;
  return (
    <Box ref={containerEl} sx={{
      height: 'calc(100% - 110px)'
    }}>
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