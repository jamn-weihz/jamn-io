import { gql, useMutation, useReactiveVar } from '@apollo/client';
import { sessionVar } from '../cache';

const LEAVE_ROLE = gql`
  mutation RemoveRole($sessionId: String!, $roleId: String!) {
    removeRole(sessionId: $sessionId, roleId: $roleId) {
      id
      deleteDate
    }
  }
`;

export default function useRemoveRole() {
  const sessionDetail = useReactiveVar(sessionVar);
  const [remove] = useMutation(LEAVE_ROLE, {
    onError: error => {
      console.error(error);
    },
    onCompleted: data => {
      console.log(data);
    }
  });

  const removeRole = (roleId: string) => {
    remove({
      variables: {
        sessionId: sessionDetail.id,
        roleId,
      }
    })
  };

  return { removeRole };
}