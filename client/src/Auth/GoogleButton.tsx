import { Button } from '@mui/material';
import GoogleLogin, { GoogleLoginResponse, GoogleLoginResponseOffline } from 'react-google-login';
import { GOOGLE_CLIENT_ID } from '../constants';
import { gql, useMutation } from '@apollo/client';
import { Dispatch, SetStateAction } from 'react';
import { USER_FIELDS } from '../fragments';
import { userVar } from '../cache';
import { useNavigate } from 'react-router-dom';
 
const REGISTER_USER = gql`
  mutation LoginGoogleUser($token: String) {
    loginGoogleUser(token: $token) {
      ...UserFields
    }
  }
  ${USER_FIELDS}
`;

interface GoogleButtonProps {
  isRegistration: boolean;
  setMessage: Dispatch<SetStateAction<string>>;
}

export default function GoogleButton(props: GoogleButtonProps) {
  const navigate = useNavigate();
  const [loginGoogleUser] = useMutation(REGISTER_USER, {
    onError: error => {
      console.error(error);
    },
    onCompleted: data => {
      console.log(data);
      userVar({
        user: data.loginGoogleUser,
      });
      navigate(`/u/${encodeURIComponent(data.loginGoogleUser.name)}`);
    } 
  });

  const handleSuccess = (response: GoogleLoginResponse | GoogleLoginResponseOffline) => {
    console.log('handleSuccess', response)
    if ('accessToken' in response) {
      loginGoogleUser({
        variables: {
          token: response.accessToken,
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