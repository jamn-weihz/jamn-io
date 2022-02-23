import { gql, useApolloClient, useMutation, useReactiveVar } from '@apollo/client';
import { colVar, userVar } from '../cache';
import { v4 as uuidv4 } from 'uuid';
import { COL_FIELDS, FULL_USER_FIELDS } from '../fragments';
import { User } from '../types/User';
import { Col } from '../types/Col';

const REMOVE_COL = gql`
  mutation RemoveCol($colId: String!) {
    removeCol(colId: $colId) {
      id
      i
      deleteDate
    }
  }
`;

export default function useRemoveCol() {
  const client = useApolloClient();

  const userDetail = useReactiveVar(userVar);
  const colDetail = useReactiveVar(colVar);

  const [remove] = useMutation(REMOVE_COL, {
    onError: error => {
      console.error(error);
    },
    onCompleted: data => {
      console.log(data);
      const user = client.cache.readFragment({
        id: client.cache.identify(userDetail || {}),
        fragment: FULL_USER_FIELDS,
        fragmentName: 'FullUserFields',
      }) as User;
      userVar(user);
    }
  });

  const removeCol = (col: Col) => {
    if (userDetail?.id) {
      remove({
        variables: {
          colId: col.id,
        }
      })
    }
    else {
      colVar({
        ...colDetail,
        cols: colDetail.cols.splice(col.i, 1)
      });
    }
  }

  return { removeCol }
}