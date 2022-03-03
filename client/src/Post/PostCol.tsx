import { gql, useLazyQuery } from '@apollo/client';
import { Box } from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import ColBar from '../Col/ColBar';
import { FULL_POST_FIELDS } from '../fragments';
import Loading from '../Loading';
import NotFound from '../NotFound';
import { ColUnit } from '../types/Col';
import { Post } from '../types/Post';
import { v4 as uuidv4 } from 'uuid'; 
import Surveyor from '../Item/ItemSurveyor';
import { SurveyorSlice, SurveyorState } from '../types/Surveyor';
import { Item } from '../types/Item';
import { ItemContext } from '../App';

const GET_POST = gql`
  query GetPost($postId: String!) {
    getPost(postId: $postId) {
      ...FullPostFields
    }
  }
  ${FULL_POST_FIELDS}
`;

interface PostColProps {
  colUnit: ColUnit;
  id: string;
}
export default function PostCol(props: PostColProps) {
  const [post, setPost] = useState(null as Post | null);
  const [isLoading, setIsLoading] = useState(false);

  const [surveyorState, setSurveyorState] = useState(null as unknown as SurveyorState);

  const { state, dispatch } = useContext(ItemContext);

  useEffect(() => {
    if (post?.id && !surveyorState) {
      const item: Item = {
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
        isRootRecentUserVoteItem: false,
      };
      dispatch({
        type: 'MERGE_ITEMS',
        idToItem: {
          [item.id]: item
        },
      });
      const surveyorSlice: SurveyorSlice = {
        originalQuery: '',
        query: '',
        itemIds: [item.id],
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

  const [getPost] = useLazyQuery(GET_POST, {
    onError: error => {
      console.error(error);
      setIsLoading(false);
    },
    onCompleted: data => {
      if (isLoading) {
        console.log(data);
        setIsLoading(false)
        setPost(data.getPost)
      }
    }
  });

  useEffect(() => {
    setIsLoading(true);
    getPost({
      variables: {
        postId: props.id, 
      }
    })
  }, [props.id]);

  if (isLoading) return <Loading />

  if (!surveyorState) return null;

  return (
    <Box sx={{
      height: '100%',
    }}>
      <ColBar colUnit={props.colUnit} />
      <Box sx={{
        height: 'calc(100% - 70px)',
        overflow: 'scroll',
      }}>
      {
        post?.id
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