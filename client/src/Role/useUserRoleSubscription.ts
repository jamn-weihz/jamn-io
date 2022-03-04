

import { gql, Reference, useApolloClient, useReactiveVar, useSubscription } from '@apollo/client';
import { useContext } from 'react';
import { UserContext } from '../App';
import { sessionVar } from '../cache';
import { ROLE_FIELDS } from '../fragments';

const USER_ROLE = gql`
  subscription userRole($sessionId: String!, $userId: String!) {
    userRole(sessionId: $sessionId, userId: $userId) {
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

export default function useUserRoleSubscription(userId: string) {
  const { dispatch } = useContext(UserContext);

  const client = useApolloClient();
  const sessionDetail = useReactiveVar(sessionVar);

  useSubscription(USER_ROLE, {
    variables: {
      sessionId: sessionDetail.id,
      userId,
    },
    onSubscriptionData: ({subscriptionData: {data: {userRole}}}) => {
      console.log(userRole);
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
        data: userRole,
      });
      const newRef = client.cache.writeFragment({
        id: client.cache.identify(userRole),
        fragment: ROLE_FIELDS,
        data: userRole,
      });
      client.cache.modify({
        id: client.cache.identify(userRole.user),
        fields: {
          roles: (cachedRefs, {readField}) => {
            const isPresent = cachedRefs.some((ref: Reference) => {
              return readField('id', ref) === userRole.id;
            });
            if (isPresent) return cachedRefs
            return [...cachedRefs, newRef];
          },
        },
      });

      dispatch({
        type: 'REFRESH_USER',
        userId: userRole.userId,
      })
    }
  })
}