import { useReactiveVar } from '@apollo/client';
import { Box } from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import { CardContext } from '../App';
import { userVar } from '../cache';
import Surveyor from '../Card/CardSurveyor';
import Loading from '../Loading';
import useGetPosts from '../Post/useGetPosts';
import { ColUnit } from '../types/Col';
import { SurveyorState } from '../types/Surveyor';
import { User } from '../types/User';
import { v4 as uuidv4 } from 'uuid';
import { Post } from '../types/Post';
import { Card, CardState } from '../types/Card';

interface UserSubsProps {
  user: User;
  colUnit: ColUnit;
}
export default function UserSubs(props: UserSubsProps) {
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
    scrollToBottom: false,
  } as SurveyorState);

  const [isLoading, setIsLoading] = useState(false);

  const { getPosts } = useGetPosts((posts: Post[]) => {
    const slice = surveyorState.stack[surveyorState.index];

    const cardIds: string[] = [];
    const idToCard: CardState = {};
    posts.forEach(post => {
      const card: Card = {
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
        isRootRecentUserVoteCard: false,
      };
      cardIds.push(card.id);
      idToCard[card.id] = card;
    });
    
    dispatch({
      type: 'MERGE_ITEMS',
      idToCard,
    });

    const stack = surveyorState.stack.slice();
    stack.splice(surveyorState.index, 1, {
      ...slice,
      cardIds: [...slice.cardIds, ...cardIds]
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
      let cardId;
      slice.cardIds.some(id => {
        if (state[id].postId === sub.postId) {
          cardId = id;
          return true;
        }
        return false
      });

      if (!cardId) {
        postIds.push(sub.postId);
      }
    });

    if (postIds.length) {
      getPosts(postIds);
    }

    const cardIds: string[] = [];
    slice.cardIds.forEach(cardId => {
      const isSubbed = props.user.subs.some(sub => sub.postId === state[cardId].postId);
      if (isSubbed) {
        cardIds.push(cardId);
      }
    });

    const stack = surveyorState.stack.slice();
    stack.splice(surveyorState.index, 1, {
      ...slice,
      cardIds,
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