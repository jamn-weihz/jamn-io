import { gql, Reference, useApolloClient, useReactiveVar, useSubscription } from '@apollo/client';
import { sessionVar } from '../cache';
import { ROLE_FIELDS } from '../fragments';

const JAM_ROLE = gql`
  subscription JamRole($sessionId: String!, $jamId: String!) {
    jamRole(sessionId: $sessionId, jamId: $jamId) {
      ...RoleFields
      user {
        id
        name
        color
      }
      jam {
        id
        name
        color
      }
    }
  }
  ${ROLE_FIELDS}
`;

export default function useJamRoleSubscription(jamId: string) {
  const client = useApolloClient();
  const sessionDetail = useReactiveVar(sessionVar);
  useSubscription(JAM_ROLE, {
    variables: {
      sessionId: sessionDetail.id,
      jamId,
    },
    onSubscriptionData: ({subscriptionData: {data: {jamRole}}}) => {
      console.log(jamRole);
      client.cache.writeQuery({
        query: gql`
          query WriteRole {
            ...RoleFields
            user {
              id
              name
              color
            }
            jam {
              id
              name
              color
            }
          }
          ${ROLE_FIELDS}
        `,
        data: jamRole,
      });
      const newRef = client.cache.writeFragment({
        id: client.cache.identify(jamRole),
        fragment: ROLE_FIELDS,
        data: jamRole,
      });
      client.cache.modify({
        id: client.cache.identify(jamRole.jam),
        fields: {
          roles: (cachedRefs, {readField}) => {
            const isPresent = cachedRefs.some((ref: Reference) => {
              return readField('id', ref) === jamRole.id;
            });
            if (isPresent) return cachedRefs
            return [...cachedRefs, newRef];
          },
        },
      });
    }
  })
}