import { gql, Reference, useMutation, useReactiveVar } from '@apollo/client';
import { sessionVar, userVar } from '../cache';
import { ROLE_FIELDS } from '../fragments';
import { Jam } from '../types/Jam';

const REQUEST_ROLE = gql`
  mutation RequestRole($sessionId: String!, $jamId: String!) {
    requestRole(sessionId: $sessionId, jamId: $jamId) {
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

export default function useRequestRole() {
  const userDetail = useReactiveVar(userVar);
  const sessionDetail = useReactiveVar(sessionVar);

  const [request] = useMutation(REQUEST_ROLE, {
    onError: error => {
      console.error(error);
    },
    update: (cache, {data: {requestRole}}) => {
      const newRef = cache.writeFragment({
        id: cache.identify(requestRole),
        fragment: ROLE_FIELDS,
        data: requestRole,
      });
      cache.modify({
        id: cache.identify(requestRole.jam),
        fields: {
          roles: (cachedRefs, {readField}) => {
            const isPresent = cachedRefs.some((ref: Reference) => {
              return readField('id', ref) === requestRole.id;
            })
            if (isPresent) return cachedRefs;
            return [...cachedRefs, newRef]
          },
        }
      });
      cache.modify({
        id: cache.identify(userDetail || {}),
        fields: {
          roles: (cachedRefs, {readField}) => {
            const isPresent = cachedRefs.some((ref: Reference) => {
              return readField('id', ref) === requestRole.id;
            })
            if (isPresent) return cachedRefs;
            return [...cachedRefs, newRef]
          }
        }
      })
    },
    onCompleted: data => {
      console.log(data);
    },
  });

  const requestRole = (jamId: string) => {
    request({
      variables: {
        sessionId: sessionDetail.id,
        jamId,
      }
    });
  }
  return { requestRole }
}