import { gql, useMutation, useReactiveVar } from '@apollo/client';
import { addColVar, userVar } from '../cache';
import { v4 as uuidv4 } from 'uuid';
import { COL_FIELDS } from '../fragments';
import { useContext } from 'react';
import { ColContext, ColContextType } from '../App';
import { useNavigate } from 'react-router-dom';

const ADD_COL = gql`
  mutation AddCol($pathname: String!) {
    addCol(pathname: $pathname) {
      ...ColFields
    }
  }
  ${COL_FIELDS}
`;

export default function useAddCol(context?: ColContextType) {
  const navigate = useNavigate();

  let { state, dispatch } = useContext(ColContext);
  if (!state && !dispatch && context) {
    state = context.state;
    dispatch = context.dispatch;
  }

  const userDetail = useReactiveVar(userVar);
  const addColDetail = useReactiveVar(addColVar);

  const [add] = useMutation(ADD_COL, {
    onError: error => {
      console.error(error);
    },
    onCompleted: data => {
      console.log(data);
      dispatch({
        type: 'ADD_COL',
        col: data.addCol,
        id: uuidv4(),
        navigate: true,
      });
    }
  });

  const addCol = (pathname: string) => {

    if (userDetail?.id) {
      add({
        variables: {
          pathname,
        }
      })
    }
    else {
      dispatch({
        type: 'ADD_COL',
        col: {
          i: state.colUnits.length,
          id: uuidv4(),
          pathname,
          __typename: 'Col',
        },
        id: uuidv4(),
        navigate: true,
      });
    }
  }

  return { addCol }
}