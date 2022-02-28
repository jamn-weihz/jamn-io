import { gql, useApolloClient, useMutation, useReactiveVar } from '@apollo/client';
import { colVar, userVar } from '../cache';
import { v4 as uuidv4 } from 'uuid';
import { COL_FIELDS, FULL_USER_FIELDS } from '../fragments';
import { User } from '../types/User';
import { Col, ColState } from '../types/Col';

const REMOVE_COL = gql`
  mutation RemoveCol($colId: String!) {
    removeCol(colId: $colId) {
      id
      i
      deleteDate
    }
  }
`;

export default function useRemoveCol(col: Col) {
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
      const colStates = [] as ColState[];
      colDetail.colStates.forEach(colState_i => {
        if (colState_i.col.i < col.i) {
          colStates.push(colState_i);
        }
        else if (colState_i.col.i > col.i) {
          colStates.push({
            ...colState_i,
            col: {
              ...colState_i.col,
              i: colState_i.col.i - 1,
            },
          });
        }
      })
      colVar({
        ...colDetail,
        colStates,
      });
    }
  });

  const removeCol = () => {
    if (userDetail?.id) {
      remove({
        variables: {
          colId: col.id,
        }
      })
    }
    else {
      const colStates = [] as ColState[];
      colDetail.colStates.forEach(colState_i => {
        if (colState_i.col.i < col.i) {
          colStates.push(colState_i);
        }
        else if (colState_i.col.i > col.i) {
          colStates.push({
            ...colState_i,
            col: {
              ...colState_i.col,
              i: colState_i.col.i - 1,
            },
          });
        }
      })
      colVar({
        ...colDetail,
        colStates,
      });
    }
  }

  return { removeCol }
}