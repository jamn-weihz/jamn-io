import { gql, useMutation } from '@apollo/client';
import { connectHits } from 'react-instantsearch-dom';
import { SurveyorState } from '../types/Surveyor';
import { v4 as uuidv4 } from 'uuid'; 
import { Dispatch, SetStateAction, useContext, useEffect, useState,  } from 'react';
import { FULL_POST_FIELDS } from '../fragments';
import { Col } from '../types/Col';
import { Card, CardState } from '../types/Card';
import { CardContext } from '../App';
import useGetPosts from '../Post/useGetPosts';

interface HitsProps {
  col: Col;
  hits: any[];
  setReload: Dispatch<SetStateAction<boolean>>;
  surveyorState: SurveyorState;
  setSurveyorState: Dispatch<SetStateAction<SurveyorState>>;
}
function Hits(props: HitsProps) {
  const { state, dispatch } = useContext(CardContext);

  const [hits, setHits] = useState([] as any[]);

  const { getPosts } = useGetPosts(() => {
    props.setReload(true);
  });

  useEffect(() => {
    let isChange = props.hits.some((hit, i) => hit.id != hits[i]?.id);
    if (!isChange) return;

    console.log('hits');

    setHits(props.hits);

    const slice = props.surveyorState.stack[props.surveyorState.index];

    const idToCard: CardState = {};
    const cardIds: string[] = [];
    if (props.hits.length) {
      props.hits.forEach(hit => {
        if (hit.__typename === 'Post') {
          let cardId;
          slice.cardIds.some(id => {
            if (state[id].postId === hit.id) {
              cardId = id;
              return true;
            }
            return false;
          });
          if (cardId) {
            cardIds.push(cardId);
          }
          else {
            const card: Card = {
              id: uuidv4(),
              userId: hit.userId,
              parentId: '',
              linkId: '',
              postId: hit.id,
              showNext: false,
              showPrev: false,
              nextIds: [],
              prevIds: [],
              isNewlySaved: false,
              refreshPost: false,
              getLinks: false,
              isRootRecentUserVoteCard: false,
            };
            idToCard[card.id] = card;
            cardIds.push(card.id);
          }
        }
      });
      if (Object.keys(idToCard).length) {
        getPosts(Object.keys(idToCard).map(id => idToCard[id].postId));
      }
    }
    if (Object.keys(idToCard).length) {
      dispatch({
        type: 'MERGE_ITEMS',
        idToCard,
      });
    }
    const stack = props.surveyorState.stack.slice()
    stack.splice(props.surveyorState.index, 1, {
      ...slice,
      cardIds,
    });
    props.setSurveyorState({
      ...props.surveyorState,
      stack,
      triggerRefinement: false,
    });
  }, [props.hits])

  return null;
}
const CustomHits = connectHits(Hits);

export default CustomHits