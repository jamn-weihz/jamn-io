import { useReactiveVar } from '@apollo/client';
import { useReducer } from 'react';
import { addColVar } from '../cache';
import { ColAction, ColState } from '../types/Col';
import reduceInitCols from './reduceInitCols';
import reduceRemoveCol from './reduceRemoveCol';
import reduceResetCols from './reduceResetCols';
import reduceShiftCols from './reduceShiftCols';


export default function useColStore() {
  const addColDetail = useReactiveVar(addColVar);

  const colReducer = (state: ColState, action: ColAction) => {
    console.log(action);
    switch (action.type) {
      case 'RESET_COLS':
        return reduceResetCols(state, action);
      case 'INIT_COLS':
        return reduceInitCols(state, action);
      case 'ADD_COL':
        return {
          ...state,
          colUnits: [...state.colUnits, {
            col: action.col,
            stack: [{
              pathname: action.col.pathname,
              id: addColDetail.id || action.id,
            }],
            index: 0,
            showOptions: false,
          }],
          i: state.colUnits.length,
          showAdder: false,
          navigate: addColDetail.id 
            ? false
            : action.navigate,
          scroll: true,
          addedCol: addColDetail.id
            ? action.col
            : null,
        };
      case 'REMOVE_COL':
        return reduceRemoveCol(state, action);
      case 'UPDATE_COL':
        const colUnits = state.colUnits.slice();
        colUnits.splice(action.colUnit.col.i, 1, action.colUnit);
        return {
          ...state,
          colUnits,
          navigate: action.navigate,
        };
      case 'SHIFT_COLS':
        return reduceShiftCols(state, action);
      case 'SELECT_COL':
        return {
          ...state,
          i: action.i,
          showAdder: false,
          scroll: action.scroll,
          navigate: action.navigate,
        };
      case 'SHOW_ADDER':
        return {
          ...state,
          showAdder: true,
        };
      case 'HIDE_ADDER':
        return {
          ...state,
          showAdder: false,
        };
      case 'TOGGLE_COL_OPTIONS':
        return {
          ...state,
          colUnits: state.colUnits.map(colUnit => {
            if (colUnit.col.id === action.col.id) {
              return {
                ...colUnit,
                showOptions: !colUnit.showOptions,
              };
            }
            return colUnit;
          }),
        };
      case 'SCROLL_COMPLETE':
        return {
          ...state,
          scroll: false,
        };
      case 'NAVIGATE_COMPLETE':
        return {
          ...state,
          navigate: false,
        }
      case 'CLEAR_ADDED_COL_COMPLETE':
        return {
          ...state,
          addedCol: null,
        };
      default:
        throw new Error('Invalid action type')
    }
  }
  return useReducer(colReducer, {
    isInit: false,
    showAdder: false,
    colUnits: [],
    i: 0,
    scroll: false,
    navigate: false,
    addedCol: null,
  });
}