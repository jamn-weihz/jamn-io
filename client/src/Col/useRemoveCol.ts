import { gql, useMutation, useReactiveVar } from '@apollo/client';
import { userVar } from '../cache';
import { Col } from '../types/Col';
import { useContext } from 'react';
import { ColContext } from '../App';

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
  const { state, dispatch } = useContext(ColContext);

  const userDetail = useReactiveVar(userVar);

  const [remove] = useMutation(REMOVE_COL, {
    onError: error => {
      console.error(error);
    },
    onCompleted: data => {
      console.log(data);
      dispatch({
        type: 'REMOVE_COL',
        col,
      })
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
      dispatch({
        type: 'REMOVE_COL',
        col: col,
      })
    }
  }

  return { removeCol }
}