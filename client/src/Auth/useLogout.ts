import { gql, useMutation, useReactiveVar } from '@apollo/client'
import { tokenVar, userVar } from '../cache';
import resetCols from '../Col/resetCols';

const LOGOUT_USER = gql`
  mutation LogoutUser {
    logoutUser {
      id
    }
  }
`;

export default function useLogout() {
  const tokenDetail = useReactiveVar(tokenVar);

  const [logout] = useMutation(LOGOUT_USER, {
    onError: error => {
      console.error(error);
    },
    onCompleted: data => {
      console.log(data);
    }
  });

  const logoutUser = () => {
    logout();
    resetCols();
    if (tokenDetail.interval) {
      clearInterval(tokenDetail.interval);
      tokenVar({
        ...tokenDetail,
        isValid: false,
        interval: null,
      });
      userVar(null);
    }
  }

  return { logoutUser };
}