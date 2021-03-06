import { gql, useMutation, useReactiveVar } from '@apollo/client';
import { snackbarVar, tokenVar, userVar } from '../cache';
import { REFRESH_ACCESS_TOKEN_TIME } from '../constants';
import useLogout from './useLogout';

const REFRESH_TOKEN = gql`
  mutation RefreshToken {
    refreshToken {
      id
    }
  }
`;

export default function useToken() {
  const { logoutUser } = useLogout();

  const tokenDetail = useReactiveVar(tokenVar);
  const userDetail = useReactiveVar(userVar);

  const [refresh] = useMutation(REFRESH_TOKEN, {
    onError: error => {
      console.error(error);
      if (error.message === 'Unauthorized') {
        if (userDetail?.id) {
          logoutUser();
          snackbarVar({
            isSessionExpired: true,
            isUnauthorized: false,
          })
        }
        tokenVar({
          ...tokenDetail,
          isInit: true,
          isValid: false
        })
      }
    },
    onCompleted: data => {
      console.log(data);
      if (data.refreshToken.id) {
        tokenVar({
          ...tokenDetail,
          isInit: true,
          isValid: true,
        })
      }
      else {
        tokenVar({
          ...tokenDetail,
          isInit: true,
          isValid: false
        })
      }
    },
  });

  const refreshToken = () => {
    refresh();
  }

  const refreshTokenInterval = () => {
    const interval = setInterval(() => {
      refresh();
    }, REFRESH_ACCESS_TOKEN_TIME);

    tokenVar({
      ...tokenDetail,
      interval,
    });
  }
  
  return { refreshToken, refreshTokenInterval };
}