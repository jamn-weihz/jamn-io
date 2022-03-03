import { gql, useMutation, useReactiveVar } from '@apollo/client';
import { Box, Card, Checkbox } from '@mui/material';
import { useState } from 'react';
import { ChromePicker } from 'react-color';
import { sessionVar, snackbarVar, userVar } from '../cache';
import { ColUnit } from '../types/Col';
import { Jam } from '../types/Jam';

const SET_JAM_COLOR = gql`
  mutation SetJamColor($sessionId: String!, $jamId: String!, $color: String!) {
    setJamColor(sessionId: $sessionId, jamId: $jamId, color: $color) {
      id
      color
    }
  }
`;

const SET_JAM_ISCLOSED = gql`
  mutation SetJamIsClosed($sessionId: String!, $jamId: String!, $isClosed: Boolean!) {
    setJamIsClosed(sessionId: $sessionId, jamId: $jamId, isClosed: $isClosed) {
      id
      isClosed
    }
  }
`;

const SET_JAM_ISPRIVATE = gql`
  mutation SetJamIsPrivate($sessionId: String!, $jamId: String!, $isPrivate: Boolean!) {
    setJamIsPrivate(sessionId: $sessionId, jamId: $jamId, isPrivate: $isPrivate) {
      id
      isPrivate
    }
  }
`;

interface JamSettingsProps {
  jam: Jam;
  colUnit: ColUnit;
}

export default function JamSettings(props: JamSettingsProps) {
  const userDetail = useReactiveVar(userVar);
  const sessionDetail = useReactiveVar(sessionVar);
  
  const [color, setColor] = useState(props.jam.color);

  const [isClosed, setIsClosed] = useState(props.jam.isClosed);
  const [isPrivate, setIsPrivate] = useState(props.jam.isPrivate);

  const [colorTimeout, setColorTimeout] = useState(null as ReturnType<typeof setTimeout> | null);

  const isAdmin = props.jam.roles.some(role => role.type === 'ADMIN' && role.userId === userDetail?.id)
  
  const [setJamColor] = useMutation(SET_JAM_COLOR, {
    onError: error => {
      console.error(error);
      if (error.message === 'Unauthorized') {
        snackbarVar({
          isUnauthorized: true,
          isSessionExpired: false,
        });
      }
    },
    onCompleted: data => {
      console.log(data);
    },
  });

  const [setJamIsClosed] = useMutation(SET_JAM_ISCLOSED, {
    onError: error => {
      console.error(error);
      if (error.message === 'Unauthorized') {
        snackbarVar({
          isUnauthorized: true,
          isSessionExpired: false,
        });
      }
    },
    onCompleted: data => {
      console.log(data);
    },
  });

  const [setJamIsPrivate] = useMutation(SET_JAM_ISPRIVATE, {
    onError: error => {
      console.error(error);
      if (error.message === 'Unauthorized') {
        snackbarVar({
          isUnauthorized: true,
          isSessionExpired: false,
        });
      }
    },
    onCompleted: data => {
      console.log(data);
    },
  });

  const handleColorChange = (color: any) => {
    if (!isAdmin) return; 
    setColor(color.hex);
  };

  const handleColorChangeComplete = (color: any) => {
    if (!isAdmin) return;
    if (colorTimeout) {
      clearTimeout(colorTimeout);
    }
    const timeout = setTimeout(() => {
      setJamColor({
        variables: {
          sessionId: sessionDetail.id,
          jamId: props.jam.id,
          color: color.hex,
        },
      });
      setColorTimeout(null);
    }, 500);
    setColorTimeout(timeout);
  };

  const handleCloseChange = () => {
    if (!isAdmin) return;
    setJamIsClosed({
      variables: {
        sessionId: sessionDetail.id,
        jamId: props.jam.id,
        isClosed: !isClosed,
      }
    });
    setIsClosed(!isClosed);
  }

  const handlePrivateChange = () => {
    if (!isAdmin) return;
    setJamIsPrivate({
      variables: {
        sessionId: sessionDetail.id,
        jamId: props.jam.id,
        isPrivate: !isPrivate,
      }
    })
    setIsPrivate(!isPrivate);
  }

  return (
    <Box>
      <Card elevation={5} sx={{
        margin: 1,
        padding: 1,
      }}>
        <Box sx={{
          display: 'flex',
          flexDirection: 'row',
          margin: 1,
        }}>
          <Checkbox disabled={!isAdmin} checked={isClosed} onChange={handleCloseChange}/>
          Closed (new members require approval)
        </Box>
        <Box sx={{
          margin: 1,
          display: 'flex',
          flexDirection: 'row',
        }}>
          <Checkbox disabled={!isAdmin} checked={isPrivate} onChange={handlePrivateChange}/>
          Private (posts visible only to members)
        </Box>
        <Box sx={{
          margin: 1,
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