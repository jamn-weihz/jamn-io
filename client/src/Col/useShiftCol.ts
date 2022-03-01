import { gql, useMutation, useReactiveVar } from '@apollo/client';
import { useContext } from 'react';
import { ColContext } from '../App';
import { sizeVar, userVar } from '../cache';
import { MOBILE_WIDTH } from '../constants';
import { COL_FIELDS } from '../fragments';
import { Col } from '../types/Col';

const SHIFT_COL = gql`
  mutation ShiftCol($colId: String!, $di: Int!) {
    shiftCol(colId: $colId, di: $di) {
      ...ColFields
    }
  }
  ${COL_FIELDS}
`;

export default function useShiftCol(col: Col, di: number) {
  const { state, dispatch } = useContext(ColContext);

  const userDetail = useReactiveVar(userVar);
  const sizeDetail = useReactiveVar(sizeVar);

  const [shift] = useMutation(SHIFT_COL, {
    onError: error => {
      console.error(error);
    },
    onCompleted: data => {
      console.log(data);
      dispatch({
        type: 'SHIFT_COLS',
        cols: data.shiftCol,
        i: col.i + di,
        scroll: sizeDetail.width < MOBILE_WIDTH
      })
    }
  })

  const shiftCol = () => {
    if (userDetail?.id) {
      shift({
        variables: {
          colId: col.id,
          di,
        }
      });
    }
    else {
      let col1 = null as Col | null;
      state.colUnits.some(colUnit => {
        if (colUnit.col.i === col.i + di) {
          col1 = colUnit.col;
          return true;
        }
        return false;
      });

      if (!col1) {
        throw new Error('Missing col')
      }

      dispatch({
        type: 'SHIFT_COLS',
        cols: [
          {
            ...col,
            i: col.i + di,
          },
          {
            ...col1,
            i: col.i,
          },
        ],
        i: col.i + di,
        scroll: sizeDetail.width < MOBILE_WIDTH,
      })
    }
  }
  return { shiftCol }
}