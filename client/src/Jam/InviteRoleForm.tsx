import { gql, useMutation, useReactiveVar } from '@apollo/client';
import { Box, Button, FormControl, FormHelperText, InputLabel, OutlinedInput } from '@mui/material';
import React, { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { paletteVar } from '../cache';
import { ROLE_FIELDS } from '../fragments';
import { Jam } from '../types/Jam';
import { getColor } from '../utils';


const INVITE_ROLE = gql`
  mutation InviteRole($userName: String!, $jamId: String!) {
    inviteRole(userName: $userName, jamId: $jamId) {
      ...RoleFields 
      user {
        id
        color
        name
      }
    }
  }
  ${ROLE_FIELDS}
`;

interface InviteRoleFormProps {
  jam: Jam;
  setIsInviting: Dispatch<SetStateAction<boolean>>;
}

export default function InviteRoleForm(props: InviteRoleFormProps) {
  const paletteDetail = useReactiveVar(paletteVar);

  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const userNameEl = useRef<HTMLInputElement>();

  useEffect(() => {
    userNameEl.current?.focus();
  }, []);

  const [inviteRole] = useMutation(INVITE_ROLE, {
    onError: error => {
      console.error(error);
      setError(error.message);
    },
    update: (cache, {data: {inviteRole}}) => {
      cache.modify({
        id: cache.identify(props.jam),
        fields: {
          roles: cachedRefs => {
            const newRef = cache.writeFragment({
              id: cache.identify(inviteRole),
              fragment: ROLE_FIELDS,
              data: inviteRole,
            });
            return [...cachedRefs, newRef];
          }
        }
      })
    },
    onCompleted: data =>  {
      console.log(data);
    },
  })

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  }

  const handleCancelClick = (event: React.MouseEvent) => {
    props.setIsInviting(false);
  }

  const handleInviteClick = (event: React.MouseEvent) => {
    inviteRole({
      variables: {
        userName: name,
        jamId: props.jam.id,
      },
    });
  }

  const color = getColor(paletteDetail.mode)
  return (
    <Box>
      <FormControl margin='dense' sx={{width: '100%'}}>
        <InputLabel htmlFor='user-name' variant='outlined'>Name</InputLabel>
        <OutlinedInput
          inputRef={userNameEl}
          id='user-name'
          type='text'
          value={name}
          onChange={handleNameChange}
          error={!!error}
          label='Name'
          sx={{
            borderColor: props.jam.color,
          }}
        />
        <FormHelperText>{error}</FormHelperText>
      </FormControl>
      <Button onClick={handleInviteClick}>
        Invite
      </Button>
      <Button onClick={handleCancelClick} sx={{
        color,
      }}>
        Cancel
      </Button>
    </Box>
  )
}