import { Button } from '@mui/material';
import GoogleLogin, { GoogleLoginResponse, GoogleLoginResponseOffline } from 'react-google-login';
import { GOOGLE_CLIENT_ID } from '../constants';
import { gql, useMutation, useReactiveVar } from '@apollo/client';
import { Dispatch, SetStateAction } from 'react';
import { USER_FIELDS } from '../fragments';
import { colVar, userVar } from '../cache';
 
const REGISTER_USER = gql`
  mutation LoginGoogleUser($token: String, $pathnames: [String!]!) {
    loginGoogleUser(token: $token, pathnames: $pathnames) {
      ...UserFields
    }
  }
  ${USER_FIELDS}
`;

interface GoogleButtonProps {
  isRegistration: boolean;
  setMessage: Dispatch<SetStateAction<string>>;
  i: number;
}
export default function GoogleButton(props: GoogleButtonProps) {
  const colDetail = useReactiveVar(colVar);

  const [loginGoogleUser] = useMutation(REGISTER_USER, {
    onError: error => {
      console.error(error);
    },
    onCompleted: data => {
      console.log(data);
      userVar(data.loginGoogleUser);
      const cols = colDetail.cols.map((col, i) => {
        if (i === props.i) {
          return {
            ...col,
            pathname: `/u/${encodeURIComponent(data.loginGoogleUser.name)}`
          };
        }
        return col;
      });
      colVar({
        ...colDetail,
        cols,
      });    
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