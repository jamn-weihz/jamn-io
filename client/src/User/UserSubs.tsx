import { useReactiveVar } from '@apollo/client';
import { Box } from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import { ItemContext } from '../App';
import { userVar } from '../cache';
import Surveyor from '../Item/ItemSurveyor';
import Loading from '../Loading';
import useGetPosts from '../Post/useGetPosts';
import { ColUnit } from '../types/Col';
import { SurveyorState } from '../types/Surveyor';
import { User } from '../types/User';
import { v4 as uuidv4 } from 'uuid';
import { Post } from '../types/Post';
import { Item, ItemState } from '../types/Item';

interface UserSubsProps {
  user: User;
  colUnit: ColUnit;
}
export default function UserSubs(props: UserSubsProps) {
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
    scrollToBottom: false,
  } as SurveyorState);

  const [isLoading, setIsLoading] = useState(false);

  const { getPosts } = useGetPosts((posts: Post[]) => {
    const slice = surveyorState.stack[surveyorState.index];

    const itemIds: string[] = [];
    const idToItem: ItemState = {};
    posts.forEach(post => {
      const item: Item = {
        id: uuidv4(),
        userId: post.userId,
        postId: post.id,
        parentId: '',
        linkId: '',
        showPrev: false,
        showNext: false,
        prevIds: [],
        nextIds: [],
        refreshPost: false,
        getLinks: false,
        isNewlySaved: false,
        isRootRecentUserVoteItem: false,
      };
      itemIds.push(item.id);
      idToItem[item.id] = item;
    });
    
    dispatch({
      type: 'MERGE_ITEMS',
      idToItem,
    });

    const stack = surveyorState.stack.slice();
    stack.splice(surveyorState.index, 1, {
      ...slice,
      itemIds: [...slice.itemIds, ...itemIds]
    });
    setSurveyorState({
      ...surveyorState,
      stack,
    })
  });

  useEffect(() => {
    const slice = surveyorState.stack[surveyorState.index];

    const postIds: string[] = [];
    props.user.subs.forEach(sub => {
      let itemId;
      slice.itemIds.some(id => {
        if (state[id].postId === sub.postId) {
          itemId = id;
          return true;
        }
        return false
      });

      if (!itemId) {
        postIds.push(sub.postId);
      }
    });

    if (postIds.length) {
      getPosts(postIds);
    }

    const itemIds: string[] = [];
    slice.itemIds.forEach(itemId => {
      const isSubbed = props.user.subs.some(sub => sub.postId === state[itemId].postId);
      if (isSubbed) {
        itemIds.push(itemId);
      }
    });

    const stack = surveyorState.stack.slice();
    stack.splice(surveyorState.index, 1, {
      ...slice,
      itemIds,
    });
    setSurveyorState({
      ...surveyorState,
      stack,
    })

  }, [props.user.subs])

  return (
    <Box sx={{
      height: userDetail?.id === props.user.id
        ? 'calc(100% - 150px)'
        : 'calc(100% - 110px)',
      overflow: 'scroll',
    }}>
      <Box sx={{
        margin: 1,
      }}>
        {
          isLoading 
            ? <Loading />
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
  )
}