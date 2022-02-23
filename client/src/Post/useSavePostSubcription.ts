import { gql, useApolloClient, useSubscription } from '@apollo/client';

const SAVE_POST = gql`
  subscription SavePost($cardIds: [String!]!) {
    savePost(cardIds: $cardIds) {
      id
      draft
      saveDate
    }
  }
`
export default function useSavePostSubcription(cardIds: string[]) {
  const client = useApolloClient();

  useSubscription(SAVE_POST, {
    shouldResubscribe: true,
    variables: {
      cardIds,
    },
    onSubscriptionData: ({subscriptionData: {data: {savePost}}}) => {
      console.log('savePost', savePost);
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