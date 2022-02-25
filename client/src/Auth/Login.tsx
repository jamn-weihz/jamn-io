import { 
  Box, 
  Button,
  Card,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  Link,
  OutlinedInput,
  TextField
} from '@mui/material';
import React, { useState } from 'react';
import GoogleButton from './GoogleButton';

import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { FULL_USER_FIELDS } from '../fragments';
import { gql, useMutation, useReactiveVar } from '@apollo/client';
import { focusVar, paletteVar, tokenVar, userVar } from '../cache';
import useToken from './useToken';
import { Col } from '../types/Col';
import useChangeCol from '../Col/useChangeCol';
import { getColor } from '../utils';
import ColBar from '../Col/ColBar';
const LOGIN_USER = gql`
  mutation LoginUser($email: String!, $pass: String!) {
    loginUser(email: $email, pass: $pass) {
      ...FullUserFields
    }
  }
  ${FULL_USER_FIELDS}
`;

interface LoginProps {
  col: Col;
}
export default function Login(props: LoginProps) {
  const tokenDetail = useReactiveVar(tokenVar);
  const paletteDetail = useReactiveVar(paletteVar);

  const [showOptions, setShowOptions] = useState(false);

  const { changeCol } = useChangeCol();
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
      userVar(data.loginUser);
      changeCol(props.col, `/u/${encodeURIComponent(data.loginUser.name)}`);
      focusVar({
        postId: data.loginUser.focusId,
      })
    }
  });

  const [email, setEmail] = useState('');

  const [pass, setPass] = useState('');
  const [showPass, setShowPass] = useState(false);

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
    loginUser({
      variables: {
        email,
        pass,
      }
    })
  };

  const handleRegisterClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    changeCol(props.col, '/register');
  };

  const handleOptionsClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    setShowOptions(!showOptions);
  };

  const isFormValid = email.length && pass.length;

  const color = getColor(paletteDetail.mode)
  return (
    <Box>
      <ColBar col={props.col}/>
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
                  sx={{
                    fontSize: 16,
                  }}
                >
                  {showPass 
                    ? <VisibilityIcon fontSize='inherit'/> 
                    : <VisibilityOffIcon fontSize='inherit'/>
                  }
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
        <Box sx={{
          marginTop: 1,
          paddingTop: 1,
          borderTop: '1px solid dimgrey',
        }}>
          <GoogleButton isRegistration={false} col={props.col}/>

        </Box>
        <Box sx={{
          marginTop: 2,
          marginBottom: 1,
          textAlign: 'center',
          color,
        }}>
          New user?&nbsp;
          <Link onClick={handleRegisterClick} sx={{
            cursor: 'pointer',
          }}>
            Register
          </Link>
        </Box>
      </Card>


    </Box>
  );
}