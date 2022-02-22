import { gql, useMutation, useReactiveVar } from '@apollo/client'
import { colVar, tokenVar, userVar } from '../cache';
import { v4 as uuidv4 } from 'uuid';

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
      ]
    })
    if (tokenDetail.interval) {
      clearInterval(tokenDetail.interval);
      tokenVar({
        isValid: false,
        interval: null,
      });
      userVar(null);
    }
  }

  return { logoutUser };
}