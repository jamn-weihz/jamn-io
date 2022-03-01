import { Box, Button } from '@mui/material';
import GoogleLogin, { GoogleLoginResponse, GoogleLoginResponseOffline } from 'react-google-login';
import { GOOGLE_CLIENT_ID } from '../constants';
import { gql, useMutation } from '@apollo/client';
import { useContext, useState } from 'react';
import { FULL_USER_FIELDS } from '../fragments';
import { focusVar, userVar } from '../cache';
import { Col } from '../types/Col';
import useToken from './useToken';
import { useNavigate } from 'react-router-dom';
import { ColContext } from '../App';
 
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
  const { state, dispatch } = useContext(ColContext);

  const [message, setMessage] = useState('');

  const { refreshTokenInterval } = useToken();
  
  const [loginGoogleUser] = useMutation(REGISTER_USER, {
    onError: error => {
      console.error(error);
      setMessage(error.message);
    },
    onCompleted: data => {
      console.log(data);
      refreshTokenInterval();
      userVar(data.loginGoogleUser);
      focusVar({
        postId: data.loginGoogleUser.focusId,
      });
      dispatch({
        type: 'INIT_COLS',
        cols: data.loginGoogleUser.cols,
      });
    },
  });

  const handleSuccess = (response: GoogleLoginResponse | GoogleLoginResponseOffline) => {
    console.log('handleSuccess', response)
    if ('accessToken' in response) {
      loginGoogleUser({
        variables: {
          token: response.accessToken,
          pathnames: state.colUnits.map(colUnit => colUnit.col.pathname),
        }
      });
    }
  }

  const handleFailure = (response: any) => {
    console.error(response);
    setMessage(response.message);
  }

  return (
    <Box>
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
    <Box sx={{
      margin: 1,
    }}>
      { message } 
    </Box>   
    </Box>
  );
}