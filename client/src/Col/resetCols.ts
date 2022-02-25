import { colVar } from '../cache';
import { v4 as uuidv4 } from 'uuid'

export default function resetCols() {
  colVar({
    isAdding: false,
    cols: [
        { 
          id: uuidv4(),
          pathname: '/register',
          i: 0,
          __typename: 'Col',
        },
        { 
          id: uuidv4(),
          pathname: '/map',
          i: 1,
          __typename: 'Col',
        },
        {
          id: uuidv4(),
          pathname: '/search',
          i: 2,
          __typename: 'Col',
      }
    ],
    i: 0,
    scroll: true
  });
}