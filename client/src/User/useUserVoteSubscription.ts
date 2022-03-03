import { gql, useApolloClient, useSubscription } from '@apollo/client';
import { FULL_VOTE_FIELDS } from '../fragments';

const USER_VOTE = gql`
  subscription userVote($userId: String!) {
    userVote(userId: $userId) {
      ...FullVoteFields
    }
  }
  ${FULL_VOTE_FIELDS}
`;

export default function useUserVoteSubscription(userId: string, onSubscriptionData: any) {
  const client = useApolloClient();

  useSubscription(USER_VOTE, {
    variables: {
      userId,
    },
    onSubscriptionData: ({subscriptionData: {data: {userVote}}}) => {
      console.log(userVote);
      client.cache.writeQuery({
        query: gql`
          query WriteVote {
            ...FullVoteFields
          }
          ${FULL_VOTE_FIELDS}
        `,
        data: userVote
      });
      onSubscriptionData(userVote);
    }
  });
}