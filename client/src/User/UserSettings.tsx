import { gql, useApolloClient, useLazyQuery, useMutation } from '@apollo/client';
import { Box, Card, FormControl, FormHelperText, IconButton, InputAdornment, InputLabel, OutlinedInput } from '@mui/material';
import React, { useState } from 'react';
import { ChromePicker } from 'react-color';
import { userVar } from '../cache';
import { FULL_USER_FIELDS } from '../fragments';
import { User } from '../types/User';

import EditIcon from '@mui/icons-material/Edit';
import SendIcon from '@mui/icons-material/Send';
import useChangeCol from '../Col/useChangeCol';
import { ColUnit } from '../types/Col';

const SET_USER_COLOR = gql`
  mutation SetUserColor($color: String!) {
    setUserColor(color: $color) {
      id
      color
    }
  }
`;

const SET_USER_NAME = gql`
  mutation SetUserName($name: String!) {
    setUserName(name: $name) {
      id
      name
    }
  }
`;

const GET_USER_BY_NAME = gql`
  query GetUserByName($name: String!) {
    getUserByName(name: $name) {
      id
      name
    }
  }
`;

interface UserSettingsProps {
  colUnit: ColUnit;
  user: User;
}

export default function UserSettings(props: UserSettingsProps) {
  const client = useApolloClient();

  const [isEditingName, setIsEditingName] = useState(false);
  const [name, setName] = useState(props.user.name);
  const [nameError, setNameError] = useState('');
  const [nameTimeout, setNameTimeout] = useState(null as ReturnType<typeof setTimeout> | null);
  const [color, setColor] = useState(props.user.color);
  const [colorTimeout, setColorTimeout] = useState(null as ReturnType<typeof setTimeout> | null);

  const { changeCol } = useChangeCol(0, true);

  const [getUserByName] = useLazyQuery(GET_USER_BY_NAME, {
    onError: error => {
      console.error(error);
    },
    onCompleted: data => {
      console.log(data);
      if (data.getUserByName?.id && data.getUserByName.id !== props.user.id) {
        setNameError('This name is already in use');
      }
    }
  });

  const [setUserColor] = useMutation(SET_USER_COLOR, {
    onError: error => {
      console.error(error);
    },
    onCompleted: data => {
      console.log(data);
      const user = client.cache.readFragment({
        id: client.cache.identify(data.setUserColor),
        fragment: FULL_USER_FIELDS,
        fragmentName: 'FullUserFields',
      }) as User;
      userVar(user);
    },
  });

  const [setUserName] = useMutation(SET_USER_NAME, {
    onError: error => {
      console.error(error);
    },
    onCompleted: data => {
      console.log(data);
      const user = client.cache.readFragment({
        id: client.cache.identify(data.setUserName),
        fragment: FULL_USER_FIELDS,
        fragmentName: 'FullUserFields',
      }) as User;
      console.log(user);
      userVar(user);
      setIsEditingName(false);
      changeCol(props.colUnit.col, `/u/${user.name}`);
    }
  })

  const handleColorChange = (color: any) => {
    setColor(color.hex);
  };

  const handleColorChangeComplete = (color: any) => {
    if (colorTimeout) {
      clearTimeout(colorTimeout);
    }
    const timeout = setTimeout(() => {
      setUserColor({
        variables: {
          userId: props.user.id,
          color: color.hex,
        },
      });
      setColorTimeout(null);
    }, 300);
    setColorTimeout(timeout);
  };

  const handleNameEditClick = (event: React.MouseEvent) => {
    setIsEditingName(true);
  };

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
    setNameError('');
    if (nameTimeout) {
      clearTimeout(nameTimeout);
    }
    const timeout = setTimeout(() => {
      getUserByName({
        variables: {
          name: event.target.value,
        },
      });
    }, 300);
    setNameTimeout(timeout);
  };

  const handleNameSubmitClick = (event: React.MouseEvent) => {
    setUserName({
      variables: {
        name,
      }
    })
  };

  const handleMouseDown = (event: React.MouseEvent) => {
    event.preventDefault();
  }

  return (
    <Box>
      <Card elevation={5} sx={{
        margin: 1,
        padding: 1,
      }}>
        <Box sx={{
          padding: 1,
        }}>
            <Box sx={{
              display: isEditingName ? 'none' : 'block'
            }}>
              { props.user.name }&nbsp;
              <Box sx={{position: 'relative', display:'inline-block'}}>
                <Box sx={{position: 'absolute', left: 0, top: -20}}>
                <IconButton onClick={handleNameEditClick} size='small' sx={{
                  fontSize: 16,
                }}>
                  <EditIcon fontSize='inherit' />
                </IconButton>
                </Box>
              </Box>
            </Box>
            <Box sx={{
              display: isEditingName ? 'block' : 'none',
              width: '100%',
              marginTop: '5px',
            }}>
              <FormControl sx={{width: '100%'}}>
                <InputLabel htmlFor='user-name' variant='outlined'>Name</InputLabel>
                <OutlinedInput
                  id='user-name'
                  type='text'
                  value={name}
                  onChange={handleNameChange}
                  error={!!nameError}
                  endAdornment={
                    <InputAdornment position='end'>
                      <IconButton
                        disabled={!name.length || !!nameError}
                        edge='end'
                        onClick={handleNameSubmitClick}
                        onMouseDown={handleMouseDown}
                        sx={{
                          fontSize: 16,
                        }}
                      >
                        <SendIcon fontSize='inherit'/>
                      </IconButton>
                    </InputAdornment>
                  }
                  label='Name'
                  sx={{
                    width: '100%'
                  }}
                />
                <FormHelperText error={true}>{nameError}</FormHelperText>
              </FormControl>
            </Box>
        </Box>
        <Box sx={{
          padding: 1,
        }}>
          { props.user.email }
        </Box>
        <Box sx={{
          padding: 1,
        }}>
          <ChromePicker 
            color={color}
            disableAlpha={true}
            onChange={handleColorChange}
            onChangeComplete={handleColorChangeComplete}
          />
        </Box>

      </Card>

    </Box>
  )
}