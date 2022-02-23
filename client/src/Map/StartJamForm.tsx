import { gql, useLazyQuery, useMutation, useReactiveVar } from '@apollo/client';
import { 
  Box,
  FormControl,
  InputLabel,
  OutlinedInput,
  FormHelperText,
  Button,
} from '@mui/material';
import React, { Dispatch, SetStateAction, useState } from 'react';
import { colVar } from '../cache';
import useChangeCol from '../Col/useChangeCol';
import { Col } from '../types/Col';

const GET_JAM_BY_NAME = gql`
  query GetJamByName($name: String!) {
    getJamByName(name: $name) {
      name
    }
  }
`;

const START_JAM = gql`
  mutation StartJam($name: String!, $desc: String!, $lng: Float!, $lat: Float!) {
    startJam(name: $name, desc: $desc, lng: $lng, lat: $lat) {
      id
      name
    }
  }
`;

interface StartJamModalProps {
  lng: number;
  lat: number;
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  col: Col;
}
export default function StartJamForm(props: StartJamModalProps) {
  const { changeCol } = useChangeCol()

  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [nameTimeout, setNameTimeout] = useState(null as ReturnType<typeof setTimeout> | null);
  const [desc, setDesc] = useState('');

  const [getJamByName] = useLazyQuery(GET_JAM_BY_NAME, {
    onError: error => {
      console.error(error);
    },
    onCompleted: data => {
      if (data.getJamByName?.name) {
        setNameError('This name is already in use');
      }
      else {
        setNameError('');
      }
    }
  });

  const [startJam] = useMutation(START_JAM, {
    onError: error => {
      console.error(error);
    },
    onCompleted: data => {
      console.log(data);
      props.setIsOpen(false);
      const pathname = `/j/${encodeURIComponent(data.startJam.name)}`;
      changeCol(props.col, pathname);
    }
  });

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
    if (event.target.value.length) {
      if (nameTimeout) {
        clearTimeout(nameTimeout);
      }
      const timeout = setTimeout(() => {
        getJamByName({
          variables: {
            name: event.target.value,
          }
        });
      }, 500);
      setNameTimeout(timeout);
    }
  };

  const handleDescChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDesc(event.target.value);
  };

  const handleClose = () => {
    props.setIsOpen(false);
  };

  const handleSubmitClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    startJam({
      variables: {
        name,
        desc,
        lng: props.lng,
        lat: props.lat,
      }
    });
  }

  const handleCancelClick =(event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    handleClose();
  }

  const isFormValid = !!name.length
  return (
    <Box sx={{
      display: props.isOpen ? 'block' : 'none',
      padding: 1,
    }}>
      <FormControl margin='dense' sx={{width: '100%'}}>
        <InputLabel htmlFor='jamn-name' variant='outlined'>Name</InputLabel>
        <OutlinedInput
          id='jamn-name'
          type='text'
          value={name}
          onChange={handleNameChange}
          error={!!nameError}
          label='Name'
        />
        <FormHelperText>{nameError}</FormHelperText>
      </FormControl>
      <FormControl margin='dense' sx={{width: '100%'}}>
        <InputLabel htmlFor='jamn-desc' variant='outlined'>Description (optional)</InputLabel>
        <OutlinedInput
          id='jamn-desc'
          type='text'
          value={desc}
          onChange={handleDescChange}
          label='Description (optional)'
        />
      </FormControl>
      <Box sx={{
        paddingTop: 1,
      }}>
        <Button disabled={!isFormValid} onClick={handleSubmitClick}>
          Start
        </Button>
        &nbsp;
        <Button color='secondary' onClick={handleCancelClick}>
          Cancel
        </Button>

      </Box>
    </Box>
  )
}