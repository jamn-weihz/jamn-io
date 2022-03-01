import { Col, ColUnit, ColState, InitColsAction } from '../types/Col';
import { v4 as uuidv4 } from 'uuid';


export default function reduceInitCols(state: ColState, action: InitColsAction): ColState {
  const colUnits = action.cols.slice()
    .sort((a: Col, b: Col) => a.i < b.i ? -1 : 1)
    .map((col: Col) => {
      return {
        col,
        stack: [{
          pathname: col.pathname,
          id: uuidv4(),
        }],
        index: 0,
      } as ColUnit;
    });

  return {
    colUnits,
    i: 0,
    isInit: true,
    scroll: true,
    navigate: true,
    addedCol: null,
    showAdder: false,
  };
}