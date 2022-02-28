import { colVar } from '../cache';
import { v4 as uuidv4 } from 'uuid'

export default function resetCols() {
  colVar({
    isAdding: false,
    colStates: [
      {
        col: { 
          id: uuidv4(),
          pathname: '/register',
          i: 0,
          __typename: 'Col',
        },
        stack: [{
          pathname: '/register'
        }],
        index: 0,
      },
      {
        col: { 
          id: uuidv4(),
          pathname: '/map',
          i: 1,
          __typename: 'Col',
        },
        stack: [{
          pathname: '/map'
        }],
        index: 0,
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
        }],
        index: 0,
      }
    ],
    i: 0,
    scroll: true
  });
}