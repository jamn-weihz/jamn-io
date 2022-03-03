import { gql, useApolloClient, useSubscription } from '@apollo/client';
import { FULL_POST_FIELDS } from '../fragments';

const JAM_POST = gql`
  subscription JamPost($jamId: String!) {
    jamPost(jamId: $jamId) {
      ...FullPostFields
    }
  }
  ${FULL_POST_FIELDS}
`;

export default function useJamPostSubscription(jamId: string, onSubscriptionData: any) {
  const client = useApolloClient();

  useSubscription(JAM_POST, {
    variables: {
      jamId,
    },
    onSubscriptionData: ({subscriptionData: {data: {jamPost}}}) => {
      console.log(jamPost);
      client.cache.writeQuery({
        query: gql`
          query WritePost {
            ...FullPostFields
          }
          ${FULL_POST_FIELDS}
        `,
        data: jamPost
      });
      onSubscriptionData(jamPost);
    }
  })
}