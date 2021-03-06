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
import React, { useContext, useState } from 'react';
import GoogleButton from './GoogleButton';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { FULL_USER_FIELDS } from '../fragments';
import { gql, useMutation, useReactiveVar } from '@apollo/client';
import { focusVar, paletteVar, tokenVar, userVar } from '../cache';
import useToken from './useToken';
import { ColUnit } from '../types/Col';
import useChangeCol from '../Col/useChangeCol';
import { getColor } from '../utils';
import ColBar from '../Col/ColBar';
import { useNavigate } from 'react-router-dom';
import { ColContext } from '../App';

const LOGIN_USER = gql`
  mutation LoginUser($email: String!, $pass: String!) {
    loginUser(email: $email, pass: $pass) {
      ...FullUserFields
    }
  }
  ${FULL_USER_FIELDS}
`;

interface LoginProps {
  colUnit: ColUnit;
}
export default function Login(props: LoginProps) {
  const navigate = useNavigate();

  const { dispatch } = useContext(ColContext);

  const tokenDetail = useReactiveVar(tokenVar);
  const paletteDetail = useReactiveVar(paletteVar);
  const [message, setMessage] = useState('');
  
  const { changeCol } = useChangeCol(0, true);
  const { refreshTokenInterval } = useToken();

  const [loginUser] = useMutation(LOGIN_USER, {
    onError: error => {
      console.error(error);
      setMessage(error.message);
    },
    onCompleted: data => {
      console.log(data);

      if (tokenDetail.interval) {
        clearInterval(tokenDetail.interval);
      }
      refreshTokenInterval();
      userVar(data.loginUser);
      focusVar({
        postId: data.loginUser.focusId,
      });
      dispatch({
        type: 'INIT_COLS',
        cols: data.loginUser.cols,
      });
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
    changeCol(props.colUnit.col, '/register');
  };

  const isFormValid = email.length && pass.length;

  const color = getColor(paletteDetail.mode)
  return (
    <Box>
      <ColBar colUnit={props.colUnit}/>
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
        <Box sx={{margin: 1}}>
        { message }
        </Box>
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
          <GoogleButton isRegistration={false} col={props.colUnit.col}/>

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