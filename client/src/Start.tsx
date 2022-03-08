import { gql, useLazyQuery } from '@apollo/client';
import { Box } from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import ColBar from './Col/ColBar';
import { FULL_POST_FIELDS } from './fragments';
import Loading from './Loading';
import NotFound from './NotFound';
import { ColUnit } from './types/Col';
import { Post } from './types/Post';
import { v4 as uuidv4 } from 'uuid'; 
import Surveyor from './Card/CardSurveyor';
import { SurveyorSlice, SurveyorState } from './types/Surveyor';
import { Card } from './types/Card';
import { CardContext } from './App';

const GET_START_POST = gql`
  query GetStartPost {
    getStartPost {
      ...FullPostFields
    }
  }
  ${FULL_POST_FIELDS}
`;

interface StartProps {
  colUnit: ColUnit;
}
export default function Start(props: StartProps) {
  const [post, setPost] = useState(null as Post | null);
  const [isLoading, setIsLoading] = useState(false);

  const [surveyorState, setSurveyorState] = useState(null as unknown as SurveyorState);

  const { state, dispatch } = useContext(CardContext);

  useEffect(() => {
    if (post?.id && !surveyorState) {
      const card: Card = {
        id: uuidv4(),
        userId: post.userId,
        parentId: '',
        linkId: '',
        postId: post.id,
        showPrev: false,
        showNext: true,
        prevIds: [],
        nextIds: [],
        isNewlySaved: false,
        refreshPost: false,
        getLinks: true,
        isRootRecentUserVoteCard: false,
      };
      dispatch({
        type: 'MERGE_ITEMS',
        idToCard: {
          [card.id]: card
        },
      });
      const surveyorSlice: SurveyorSlice = {
        originalQuery: '',
        query: '',
        cardIds: [card.id],
      };
      const surveyorState: SurveyorState = {
        index: 0,
        stack: [surveyorSlice],
        reload: false,
        triggerRefinement: false,
        scrollToTop: false,
        scrollToBottom: false,
      };
      setSurveyorState(surveyorState);
    }
  }, [post?.id]);

  const [getStartPost] = useLazyQuery(GET_START_POST, {
    onError: error => {
      console.error(error);
      setIsLoading(false);
    },
    onCompleted: data => {
      if (isLoading) {
        console.log(data);
        setIsLoading(false)
        setPost(data?.getStartPost)
      }
    }
  });

  useEffect(() => {
    setIsLoading(true);
    getStartPost()
  }, []);

  if (isLoading) return <Loading />

  return (
    <Box sx={{
      height: '100%',
    }}>
      <ColBar colUnit={props.colUnit} />
      <Box sx={{
        height: 'calc(100% - 70px)',
        overflowY: 'scroll',
      }}>
      {
        post?.id && surveyorState
          ? <Box>
              <Surveyor 
                post={post}
                colUnit={props.colUnit} 
                surveyorState={surveyorState}
                setSurveyorState={setSurveyorState}
                hideOpaquePosts={false}
              />
            </Box>
          : <NotFound />
      }
      </Box>
    </Box>
  )
}