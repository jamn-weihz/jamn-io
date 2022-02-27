import { gql, useApolloClient, useReactiveVar, useSubscription } from '@apollo/client';
import { sessionVar } from '../cache';

const SAVE_POST = gql`
  subscription SavePost($sessionId: String!, $cardIds: [String!]!) {
    savePost(sessionId: $sessionId, cardIds: $cardIds) {
      id
      draft
      saveDate
    }
  }
`
export default function useSavePostSubcription(cardIds: string[]) {
  const client = useApolloClient();
  const sessionDetail = useReactiveVar(sessionVar);
  useSubscription(SAVE_POST, {
    shouldResubscribe: true,
    variables: {
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
    },
  });
}