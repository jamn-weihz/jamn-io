import { gql, Reference, useMutation, useReactiveVar } from '@apollo/client';
import { snackbarVar, sessionVar } from '../cache';
import { ROLE_FIELDS } from '../fragments';
import { Jam } from '../types/Jam';

const INVITE_ROLE = gql`
  mutation InviteRole($sessionId: String!, $userName: String!, $jamId: String!) {
    inviteRole(sessionId: $sessionId, userName: $userName, jamId: $jamId) {
      ...RoleFields 
      user {
        id
        color
        name
      }
      jam {
        id
        color
        name
      }
    }
  }
  ${ROLE_FIELDS}
`;


export default function useInviteRole(jamId: string, handleError: any) {
  const sessionDetail = useReactiveVar(sessionVar);
  const [invite] = useMutation(INVITE_ROLE, {
    onError: error => {
      console.error(error);
      if (error.message === 'Unauthorized') {
        snackbarVar({
          isUnauthorized: true,
          isSessionExpired: false,
        })
      }
      handleError(error.message)
    },
    update: (cache, {data: {inviteRole}}) => {
      const newRef = cache.writeFragment({
        id: cache.identify(inviteRole),
        fragment: ROLE_FIELDS,
        data: inviteRole,
      });
      cache.modify({
        id: cache.identify(inviteRole.user),
        fields: {
          roles: (cachedRefs, {readField}) => {
            const isPresent = cachedRefs.some((ref: Reference) => {
              return readField('id', ref) === inviteRole.id
            });
            if (isPresent) return cachedRefs;
            return [...cachedRefs, newRef];
          }
        }
      });
      cache.modify({
        id: cache.identify(inviteRole.jam),
        fields: {
          roles: (cachedRefs, {readField}) => {
            const isPresent = cachedRefs.some((ref: Reference) => {
              return readField('id', ref) === inviteRole.id
            });
            if (isPresent) return cachedRefs;
            return [...cachedRefs, newRef];
          }
        }
      });
    },
    onCompleted: data =>  {
      console.log(data);
    },
  });

  const inviteRole = (userName: string) => {
    invite({
      variables: {
        sessionId: sessionDetail.id,
        jamId,
        userName,
      }
    })
  };

  return { inviteRole };
}