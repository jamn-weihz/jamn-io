import { gql, useMutation, useReactiveVar } from '@apollo/client'
import { useContext } from 'react';
import { ColContext } from '../App';
import { tokenVar, userVar } from '../cache';

const LOGOUT_USER = gql`
  mutation LogoutUser {
    logoutUser {
      id
    }
  }
`;

export default function useLogout() {
  const tokenDetail = useReactiveVar(tokenVar);

  const { dispatch } = useContext(ColContext);

  const [logout] = useMutation(LOGOUT_USER, {
    onError: error => {
      console.error(error);
    },
    onCompleted: data => {
      console.log(data);
      userVar(null);
    }
  });

  const logoutUser = () => {
    logout();
    userVar(null);
    dispatch({
      type: 'RESET_COLS',
    });
    dispatch({
      type: 'SELECT_COL',
      i: 0,
      navigate: true,
      scroll: true,
    })
    if (tokenDetail.interval) {
      clearInterval(tokenDetail.interval);
    }
    tokenVar({
      ...tokenDetail,
      isValid: false,
      interval: null,
    });
  }

  return { logoutUser };
}