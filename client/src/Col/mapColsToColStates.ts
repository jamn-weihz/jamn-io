import { Col, ColState } from '../types/Col';


export default function mapColsToColStates(cols: Col[]) {
  return cols.slice()
    .sort((a: Col, b: Col) => a.i < b.i ? -1 : 1)
    .map((col: Col) => {
      return {
        col,
        stack: [{
          pathname: col.pathname,
        }],
        index: 0,
      } as ColState;
    });
}