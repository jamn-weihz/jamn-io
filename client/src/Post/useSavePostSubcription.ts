import { gql, useApolloClient, useReactiveVar, useSubscription } from '@apollo/client';
import { useContext } from 'react';
import { CardContext, CardContextType, PostContext, PostContextType } from '../App';
import { sessionVar, userVar } from '../cache';
import { CardState } from '../types/Card';

const SAVE_POST = gql`
  subscription SavePost($userId: String!, $sessionId: String!, $cardIds: [String!]!) {
    savePost(userId: $userId, sessionId: $sessionId, cardIds: $cardIds) {
      id
      draft
      saveDate
    }
  }
`
export default function useSavePostSubcription(cardIds: string[], postContext: PostContextType, cardContext: CardContextType) {
  const userDetail = useReactiveVar(userVar);

  const { state: postState } = postContext;
  const { state, dispatch } = cardContext;

  const client = useApolloClient();
  const sessionDetail = useReactiveVar(sessionVar);
  useSubscription(SAVE_POST, {
    shouldResubscribe: true,
    variables: {
      userId: userDetail?.id,
      sessionId: sessionDetail.id,
      cardIds,
    },
    onSubscriptionData: ({subscriptionData: {data: {savePost}}}) => {
      console.log(savePost);
      client.cache.writeQuery({
        query: gql`
          query SavePost {
            id
            draft
            saveDate
          }
        `,
        data: savePost,
      });
      console.log(postState);

      const idToCard: CardState = {};
      postState[savePost.id].forEach(id => {
        idToCard[id] = {
          ...state[id],
          refreshPost: true,
        }
      })
      dispatch({
        type: 'MERGE_ITEMS',
        idToCard,
      })

    },
  });
}