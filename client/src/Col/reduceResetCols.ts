import { ColState, ResetColsAction } from '../types/Col';
import { v4 as uuidv4 } from 'uuid';

export default function reduceResetCols(state: ColState, action: ResetColsAction): ColState {
  return {
    ...state,
    colUnits: [
      {
        col: { 
          id: uuidv4(),
          pathname: '/register',
          i: 0,
          __typename: 'Col',
        },
        stack: [{
          pathname: '/register',
          id: uuidv4(),
        }],
        index: 0,
        showOptions: false,
      },
      {
        col: { 
          id: uuidv4(),
          pathname: '/map',
          i: 1,
          __typename: 'Col',
        },
        stack: [{
          pathname: '/map',
          id: uuidv4(),
        }],
        index: 0,
        showOptions: false,
      },
      {
        col: {
          id: uuidv4(),
          pathname: '/search',
          i: 2,
          __typename: 'Col',
        },
        stack: [{
          pathname: '/search',
          id: uuidv4(),
        }],
        index: 0,
        showOptions: false,
      }
    ],
    showAdder: false,
    i: 0,
    scroll: true,
    navigate: true,
    isInit: true,
    addedCol: null,
  };
}