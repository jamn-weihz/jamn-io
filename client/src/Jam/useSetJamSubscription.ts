import { gql, useApolloClient, useReactiveVar, useSubscription } from '@apollo/client';
import { sessionVar } from '../cache';
import { JAM_FIELDS } from '../fragments';

const SET_JAM = gql`
  subscription SetJam($sessionId: String!, $jamId: String!) {
    setJam(sessionId: $sessionId, jamId: $jamId) {
      ...JamFields
    }
  }
  ${JAM_FIELDS}
`;

export default function useSetJamSubscription(jamId: string) {
  const client = useApolloClient();

  const sessionDetail = useReactiveVar(sessionVar);

  useSubscription(SET_JAM, {
    variables: {
      sessionId: sessionDetail.id,
      jamId,
    },
    onSubscriptionData: ({subscriptionData: {data: {setJam}}}) => {
      console.log(setJam);
      client.cache.writeQuery({
        query: gql`
          query WriteJam {
            ...JamFields
          }
          ${JAM_FIELDS}
        `,
        data: setJam,
      });
    },
  })
}