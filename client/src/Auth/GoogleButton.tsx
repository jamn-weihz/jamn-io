import { Button } from '@mui/material';
import GoogleLogin, { GoogleLoginResponse, GoogleLoginResponseOffline } from 'react-google-login';
import { GOOGLE_CLIENT_ID } from '../constants';
import { gql, useMutation, useReactiveVar } from '@apollo/client';
import { Dispatch, SetStateAction } from 'react';
import { FULL_USER_FIELDS } from '../fragments';
import { colVar, focusVar, userVar } from '../cache';
import { Col } from '../types/Col';
import useChangeCol from '../Col/useChangeCol';
 
const REGISTER_USER = gql`
  mutation LoginGoogleUser($token: String!, $pathnames: [String!]!) {
    loginGoogleUser(token: $token, pathnames: $pathnames) {
      ...FullUserFields
    }
  }
  ${FULL_USER_FIELDS}
`;

interface GoogleButtonProps {
  isRegistration: boolean;
  col: Col;
}
export default function GoogleButton(props: GoogleButtonProps) {
  const colDetail = useReactiveVar(colVar);
  const { changeCol } = useChangeCol();
  
  const [loginGoogleUser] = useMutation(REGISTER_USER, {
    onError: error => {
      console.error(error);
    },
    onCompleted: data => {
      console.log(data);
      userVar(data.loginGoogleUser);
      focusVar({
        postId: data.loginGoogleUser.focusId,
      })
    },
  });

  const handleSuccess = (response: GoogleLoginResponse | GoogleLoginResponseOffline) => {
    console.log('handleSuccess', response)
    if ('accessToken' in response) {
      loginGoogleUser({
        variables: {
          token: response.accessToken,
          pathnames: colDetail.cols.map(col => col.pathname),
        }
      });
    }
  }

  const handleFailure = (response: any) => {
    console.error(response);
  }

  return (
    <GoogleLogin
      clientId={GOOGLE_CLIENT_ID}
      render={renderProps => (
        <Button 
          sx={{width: '100%'}}
          variant='contained' 
          onClick={renderProps.onClick}
        >
          {props.isRegistration ? 'register with google' : 'login with google'}
        </Button>
      )}
      onSuccess={handleSuccess}
      onFailure={handleFailure}
    />
  );
}