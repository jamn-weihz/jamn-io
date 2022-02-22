import { gql, useMutation, useReactiveVar } from '@apollo/client'
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
    if (tokenDetail.interval) {
      clearInterval(tokenDetail.interval);
      tokenVar({
        isValid: false,
        interval: null,
      });
      userVar({
        user: null,
      });
    }
  }

  return { logoutUser };
}