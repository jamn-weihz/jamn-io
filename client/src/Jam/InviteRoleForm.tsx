import { gql, useMutation, useReactiveVar } from '@apollo/client';
import { Box, Button, FormControl, FormHelperText, InputLabel, OutlinedInput } from '@mui/material';
import React, { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { paletteVar } from '../cache';
import { ROLE_FIELDS } from '../fragments';
import { Jam } from '../types/Jam';
import { getColor } from '../utils';
import useInviteRole from '../Role/useInviteRole';

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

  const { inviteRole } = useInviteRole(props.jam.id, (error: any) => {
    setError(error.messasge)
  })

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  }

  const handleCancelClick = (event: React.MouseEvent) => {
    props.setIsInviting(false);
  }

  const handleInviteClick = (event: React.MouseEvent) => {
    inviteRole(name);
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