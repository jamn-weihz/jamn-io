import { gql, useApolloClient, useMutation } from '@apollo/client';
import { Box, Button, Card, FormControl, TextField } from '@mui/material';
import React, { useState } from 'react';
import { userVar } from '../cache';
import { USER_FIELDS } from '../fragments';
import { User } from '../types/User';


const VERIFY_USER = gql`
  mutation VerifyUser($code: String!) {
    verifyUser(code: $code) {
      id
      verifyEmailDate
    }
  }
`;

const RESEND_USER_VERIFICATION = gql`
  mutation ResendUserVerifcation {
    resendUserVerification {
      id
    }
  }
`;

export default function Verify() {
  const client = useApolloClient();

  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  
  const [verifyUser] = useMutation(VERIFY_USER, {
    onError: error => {
      console.error(error);
    },
    onCompleted: data => {
      console.log(data);
      const user = client.cache.readFragment({
        id: client.cache.identify(data.verifyUser),
        fragment: USER_FIELDS,
      }) as User;
      userVar({
        user,
      });
    }
  });

  const [resendUserVerification] = useMutation(RESEND_USER_VERIFICATION, {
    onError: error => {
      console.error(error);
    },
    onCompleted: data => {
      console.log(data);
    }
  })

  const handleCodeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCode(event.target.value);
  }

  const handleSubmitClick = (event: React.MouseEvent) => {
    verifyUser({
      variables: {
        code,
      },
    });
  }

  const handleResendClick = (event: React.MouseEvent) => {
    resendUserVerification();
  }

  return (
    <Card variant='outlined' sx={{padding: 1, margin: 1}}>
      <Box sx={{padding:1}}>
        Verify your email to complete registration.
      </Box>
      <Box>
        {message}
      </Box>
      <FormControl margin='dense' sx={{width:'100%'}}>
      <TextField
        label='Verification code'
        type='text'
        value={code}
        onChange={handleCodeChange}
        variant={'outlined'}
        sx={{width: '100%'}}
      />
      </FormControl>
      <Box sx={{width: '100%', marginTop: 1}}>
        <Button
          disabled={code.length !== 6}
          variant='contained' 
          onClick={handleSubmitClick} 
          sx={{width: '100%'}}
        >
          verify
        </Button>
      </Box>
      <Box sx={{width: '100%', marginTop: 1}}>
        <Button 
          variant='outlined'
          onClick={handleResendClick}
          sx={{width: '100%'}}
        >
          resend
        </Button>
      </Box>
    </Card>
  )

}