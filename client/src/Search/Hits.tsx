import { gql, useApolloClient, useMutation, useReactiveVar } from '@apollo/client';
import { connectHits } from 'react-instantsearch-dom';
import { surveyorVar } from '../cache';
import { SurveyorItem } from '../types/Surveyor';
import { v4 as uuidv4 } from 'uuid'; 
import { Dispatch, SetStateAction, useEffect,  } from 'react';
import { FULL_POST_FIELDS } from '../fragments';
import { Col } from '../types/Col';


const GET_POSTS = gql`
  mutation GetPosts($postIds: [String!]!) {
    getPosts(postIds: $postIds) {
      ...FullPostFields
    }
  }
  ${FULL_POST_FIELDS}
`;

interface HitsProps {
  col: Col;
  hits: any[];
  setReload?: Dispatch<SetStateAction<boolean>>;
}
function Hits(props: HitsProps) {
  const surveyorDetail = useReactiveVar(surveyorVar);
  
  const [getPosts] = useMutation(GET_POSTS, {
    onError: error => {
      console.error(error);
    },
    onCompleted: data => {
      console.log(data);
      //props.setReload(true);
    },
  });
  
  useEffect(() => {
    const items = [] as SurveyorItem[];
    const postIdToTrue = {} as any;

    if (props.hits.length) {
      props.hits.forEach(hit => {
        if (hit.__typename === 'Post') {
          postIdToTrue[hit.id] = true;
          const item = {
            postId: hit.id,
            postKey: uuidv4(),
            showNext: false,
            showPrev: false,
            next: [],
            prev: [],
            refresh: false,
          } as SurveyorItem;
          items.push(item);
        }
      });
      getPosts({
        variables: {
          postIds: Object.keys(postIdToTrue),
        }
      });
    }

    const surveyorState = surveyorDetail[props.col.id];
    const isNew = (
      items.length !== surveyorState.stack[surveyorState.index].items.length ||
      items.some((item, i) => {
        return item.postId !== surveyorState.stack[surveyorState.index].items[i]?.postId
      })
    );
    if (isNew) {
      const stack = surveyorState.stack.slice();
      stack.splice(surveyorState.index, 1, {
        ...stack[surveyorState.index],
        items,
      });
      surveyorVar({
        ...surveyorDetail,
        [props.col.id]: {
          ...surveyorState,
          stack,
        }
      });
    }
    console.log(props.hits);
  }, [props.hits])

  return null;
}
const CustomHits = connectHits(Hits);

export default CustomHits