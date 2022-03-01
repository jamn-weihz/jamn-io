import { gql, useMutation } from '@apollo/client';
import { connectHits } from 'react-instantsearch-dom';
import { SurveyorState } from '../types/Surveyor';
import { v4 as uuidv4 } from 'uuid'; 
import { Dispatch, SetStateAction, useContext, useEffect, useState,  } from 'react';
import { FULL_POST_FIELDS } from '../fragments';
import { Col } from '../types/Col';
import { Item, ItemState } from '../types/Item';
import { ItemContext } from '../App';


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
  setReload: Dispatch<SetStateAction<boolean>>;
  surveyorState: SurveyorState;
  setSurveyorState: Dispatch<SetStateAction<SurveyorState>>;
}
function Hits(props: HitsProps) {
  const { state, dispatch } = useContext(ItemContext);

  const [hits, setHits] = useState([] as any[]);

  const [getPosts] = useMutation(GET_POSTS, {
    onError: error => {
      console.error(error);
    },
    onCompleted: data => {
      console.log(data);
      props.setReload(true)
    },
  });
  
  useEffect(() => {
    let isChange = props.hits.some((hit, i) => hit.id != hits[i]?.id);
    if (!isChange) return;

    setHits(props.hits);

    const slice = props.surveyorState.stack[props.surveyorState.index];

    const idToItem = {} as ItemState;
    const itemIds = [] as string[];
    if (props.hits.length) {
      props.hits.forEach(hit => {
        if (hit.__typename === 'Post') {
          let itemId;
          slice.itemIds.some(id => {
            if (state[id].postId === hit.id) {
              itemId = id;
              return true;
            }
            return false;
          });
          if (itemId) {
            itemIds.push(itemId);
          }
          else {
            const item = {
              id: uuidv4(),
              parentId: '',
              linkId: '',
              postId: hit.id,
              showNext: false,
              showPrev: false,
              nextIds: [],
              prevIds: [],
              refresh: false,
            } as Item;
            idToItem[item.id] = item;
            itemIds.push(item.id);
          }
        }
      });
      if (Object.keys(idToItem).length) {
        getPosts({
          variables: {
            postIds: Object.keys(idToItem).map(id => idToItem[id].postId),
          }
        });
      }
    }
    if (Object.keys(idToItem).length) {
      dispatch({
        type: 'ADD_ITEMS',
        idToItem,
      });
    }
    const stack = props.surveyorState.stack.slice()
    stack.splice(props.surveyorState.index, 1, {
      ...slice,
      itemIds,
    });
    props.setSurveyorState({
      ...props.surveyorState,
      stack,
      triggerRefinement: false,
    });
    console.log('hits')
  }, [props.hits])

  return null;
}
const CustomHits = connectHits(Hits);

export default CustomHits