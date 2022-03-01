import { ColState, ColUnit, RemoveColAction } from '../types/Col';

export default function reduceRemoveCol(state: ColState, action: RemoveColAction): ColState {
  const colUnits = [] as ColUnit[];
  state.colUnits.forEach(colUnit => {
    if (colUnit.col.i < action.col.i) {
      colUnits.push(colUnit);
    }
    else if (colUnit.col.i > action.col.i) {
      colUnits.push({
        ...colUnit,
        col: {
          ...colUnit.col,
          i: colUnit.col.i - 1,
        },
      });
    }
  });
  let i = state.i;
  if (i >= colUnits.length) {
    i = colUnits.length - 1;
  }
  return {
    ...state,
    colUnits,
    i,
    navigate: state.i === action.col.i,
  }
}