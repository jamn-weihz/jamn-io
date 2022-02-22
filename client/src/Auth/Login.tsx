import { Box, Button, Card, FormControl, IconButton, InputAdornment, InputLabel, Link, OutlinedInput, TextField } from '@mui/material';
import React, { useState } from 'react';
import GoogleButton from './GoogleButton';

import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { USER_FIELDS } from '../fragments';
import { gql, useMutation, useReactiveVar } from '@apollo/client';
import { tokenVar, userVar } from '../cache';
import { useNavigate } from 'react-router-dom';
import useToken from './useToken';


const LOGIN_USER = gql`
  mutation LoginUser($email: String!, $pass: String!) {
    loginUser(email: $email, pass: $pass) {
      ...UserFields
    }
  }
  ${USER_FIELDS}
`;

export default function Login() {
  const navigate = useNavigate();

  const tokenDetail = useReactiveVar(tokenVar);

  const { refreshTokenInterval } = useToken();

  const [loginUser] = useMutation(LOGIN_USER, {
    onError: error => {
      console.error(error);
    },
    onCompleted: data => {
      console.log(data);

      if (tokenDetail.interval) {
        clearInterval(tokenDetail.interval);
      }
      refreshTokenInterval();
      userVar({
        user: data.loginUser,
      });
      navigate(`/u/${encodeURIComponent(data.loginUser.name)}`)
    }
  });

  const [email, setEmail] = useState('');

  const [pass, setPass] = useState('');
  const [showPass, setShowPass] = useState(false);

  const [message, setMessage] = useState('');
  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const handlePassChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPass(event.target.value);
  };
  const handleClickShowPass = () => {
    setShowPass(!showPass);
  };
  const handleMouseDownPass = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const handleSubmit = (event: React.MouseEvent) => {
    setMessage('')

    loginUser({
      variables: {
        email,
        pass,
      }
    })
  };

  const handleGoogleClick = (event: React.MouseEvent) => {
    setMessage('')
  };

  const handleRegisterClick = (event: React.MouseEvent) => {
    navigate('/register');
  }

  const isFormValid = email.length && pass.length;

  return (
    <Box sx={{
      padding: 1,
      textAlign: 'center',
    }}>
      Login
      <Box>
        {message}
      </Box>
      <Card elevation={5} sx={{margin:1, padding:1}}>
        <FormControl margin='dense' sx={{width: '100%'}}>
          <TextField
            label='Email'
            type='text'
            value={email}
            onChange={handleEmailChange}
            variant={'outlined'}
          />
        </FormControl>
        <FormControl margin='dense' variant='outlined' sx={{width: '100%'}}>
          <InputLabel htmlFor='pass'>Password</InputLabel>
          <OutlinedInput
            id='pass'
            type={showPass ? 'text' : 'password'}
            value={pass}
            onChange={handlePassChange}
            label='Password'
            endAdornment={
              <InputAdornment position='end'>
                <IconButton
                  edge='end'
                  tabIndex={-1}
                  onClick={handleClickShowPass}
                  onMouseDown={handleMouseDownPass}
                >
                  {showPass ? <VisibilityIcon /> : <VisibilityOffIcon />}
                </IconButton>
              </InputAdornment>
            }
          />
        </FormControl>
        <Button
          disabled={!isFormValid}
          variant='contained' 
          onClick={handleSubmit} 
          sx={{width: '100%', marginTop:1}
        }>
          login with email
        </Button>
      </Card>
      <Card elevation={5} sx={{margin:1, padding:1}} onClick={handleGoogleClick}>
        <GoogleButton isRegistration={false} setMessage={setMessage}/>
      </Card>
      New user?&nbsp;
      <Link onClick={handleRegisterClick} sx={{
        cursor: 'pointer',
      }}>
        Register
      </Link>
    </Box>
  );
}