import { gql, useMutation, useReactiveVar } from '@apollo/client';
import { userVar } from '../cache';
import { Col, ColUnit } from '../types/Col';
import { v4 as uuidv4 } from 'uuid';
import { useContext } from 'react';
import { ColContext, ColContextType } from '../App';
import { COL_FIELDS } from '../fragments';

const SAVE_COL = gql`
  mutation SaveCol($colId: String!, $pathname: String!) {
    saveCol(colId: $colId, pathname: $pathname) {
      ...ColFields
    }
  }
  ${COL_FIELDS}
`;

export default function useChangeCol(di: number, navigate: boolean, context?: ColContextType) {
  let { state, dispatch } = useContext(ColContext);
  if (!state && !dispatch && context) {
    state = context.state;
    dispatch = context.dispatch;
  }
  const userDetail = useReactiveVar(userVar);
  const [save] = useMutation(SAVE_COL, {
    onError: error => {
      console.error(error);
    },
    onCompleted: data => {
      console.log(data);

      let colUnit = null as ColUnit | null;
      state.colUnits.some(colUnit_i => {
        if (colUnit_i.col.id === data.saveCol.id) {
          colUnit = colUnit_i;
          return true;
        }
        return false;
      });

      if (!colUnit) {
        throw new Error('Missing col')
      }

      if (di === -1) {
        dispatch({
          type: 'UPDATE_COL',
          colUnit: {
            col: data.saveCol,
            stack: colUnit.stack,
            index: colUnit.index - 1,
            showOptions: colUnit.showOptions,
          },
          navigate,
        });
      }
      else if (di === 1) {
        dispatch({
          type: 'UPDATE_COL',
          colUnit: {
            col: data.saveCol,
            stack: colUnit.stack,
            index: colUnit.index + 1,
            showOptions: colUnit.showOptions,
          },
          navigate,
        });
      }
      else {
        const stack = colUnit.stack.slice(0, colUnit.index + 1);
        stack.push({
          pathname: data.saveCol.pathname,
          id: uuidv4(),
        });
        dispatch({
          type: 'UPDATE_COL',
          colUnit: {
            col: data.saveCol,
            stack,
            index: colUnit.index + 1,
            showOptions: colUnit.showOptions,
          },
          navigate,
        });
      }
    },
  });

  const changeCol = (col: Col, pathname?: string) => {
    if (col.pathname === pathname) return;

    let colUnit = null as ColUnit | null;
    state.colUnits.some(colUnit_i => {
      if (colUnit_i.col.id === col.id) {
        colUnit = colUnit_i;
        return true;
      }
      return false;
    });
    if (!colUnit) {
      throw new Error('Missing col');
    }

    if (userDetail?.id) {
      save({
        variables: {
          colId: col.id,
          pathname: di === -1
            ? colUnit.stack[colUnit.index - 1].pathname
            : di === 1
              ? colUnit.stack[colUnit.index + 1].pathname
              : pathname,
        }
      });
    }
    else {


      if (di === -1) {
        dispatch({
          type: 'UPDATE_COL',
          colUnit: {
            col: {
              ...col,
              pathname: colUnit.stack[colUnit.index - 1].pathname,
            },
            stack: colUnit.stack,
            index: colUnit.index - 1,
            showOptions: colUnit.showOptions,
          },
          navigate,
        })
      }
      else if (di === 1) {
        dispatch({
          type: 'UPDATE_COL',
          colUnit: {
            col: {
              ...col,
              pathname: colUnit.stack[colUnit.index + 1].pathname,
            },
            stack: colUnit.stack,
            index: colUnit.index + 1,
            showOptions: colUnit.showOptions,
          },
          navigate,
        });
      }
      else {
        if (!pathname) {
          throw new Error('Pathname required')
        }
        const stack = colUnit.stack.slice(0, colUnit.index + 1);
        stack.push({
          pathname,
          id: uuidv4(),
        });
        dispatch({
          type: 'UPDATE_COL',
          colUnit: {
            col: {
              ...col,
              pathname,
            },
            stack,
            index: colUnit.index + 1,
            showOptions: colUnit.showOptions,
          },
          navigate,
        });
      }
    }
  }
  return { changeCol };
}