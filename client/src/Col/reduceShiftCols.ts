import { ColState, ColUnit, ShiftColsAction } from "../types/Col";


export default function reduceShiftCols(state: ColState, action: ShiftColsAction): ColState {
  const colUnits = [] as ColUnit[];
  
  state.colUnits.forEach(colUnit => {
    if (colUnit.col.id === action.cols[0].id) {
      colUnits.push({
        ...colUnit,
        col: action.cols[0],
      });
    }
    else if  (colUnit.col.id === action.cols[1].id) {
      colUnits.push({
        ...colUnit,
        col: action.cols[1],
      });
    }
    else {
      colUnits.push(colUnit);
    }
  });

  colUnits.sort((a,b) => a.col.i < b.col.i ? -1 : 1);

  return {
    ...state,
    colUnits,
    i: action.i,
    scroll: action.scroll,
  };
}