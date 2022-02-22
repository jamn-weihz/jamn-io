import { gql, useMutation, useReactiveVar } from '@apollo/client';
import { colVar, userVar } from '../cache';
import { v4 as uuidv4 } from 'uuid';
import { COL_FIELDS } from '../fragments';

const ADD_COL = gql`
  mutation AddCol($id: String!, $pathname: String!) {
    addCol(id: $id, pathname: $pathname) {
      ...ColFields
    }
  }
  ${COL_FIELDS}
`;

export default function useAddCol() {
  const userDetail = useReactiveVar(userVar);
  const colDetail = useReactiveVar(colVar);

  const [add] = useMutation(ADD_COL, {
    onError: error => {
      console.error(error);
    },
    onCompleted: data => {
      console.log(data);
    }
  });

  const addCol = (pathname: string) => {
    const id = uuidv4();
    console.log(id);
    if (userDetail?.id) {
      add({
        variables: {
          pathname,
          id,
        }
      })
    }
    colVar({
      ...colDetail,
      cols: [...colDetail.cols, { 
        id,
        i: colDetail.cols.length,
        pathname,
        __typename: 'Col',
      }],
    });

  }

  return { addCol }
}