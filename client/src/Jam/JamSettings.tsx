import { gql, useMutation } from '@apollo/client';
import { Box, Card, Checkbox } from '@mui/material';
import React, { useState } from 'react';
import { ChromePicker } from 'react-color';
import { Col } from '../types/Col';
import { Jam } from '../types/Jam';

const SET_JAM_COLOR = gql`
  mutation SetJamColor($jamId: String!, $color: String!) {
    setJamColor(jamId: $jamId, color: $color) {
      id
      color
    }
  }
`;

const SET_JAM_ISCLOSED = gql`
  mutation SetJamIsClosed($jamId: String!, $isClosed: Boolean!) {
    setJamIsClosed(jamId: $jamId, isClosed: $isClosed) {
      id
      isClosed
    }
  }
`;

interface JamSettingsProps {
  jam: Jam;
  col: Col;
}

export default function JamSettings(props: JamSettingsProps) {
  const [color, setColor] = useState(props.jam.color);

  const [isClosed, setIsClosed] = useState(props.jam.isClosed);

  const [colorTimeout, setColorTimeout] = useState(null as ReturnType<typeof setTimeout> | null);

  const [setJamColor] = useMutation(SET_JAM_COLOR, {
    onError: error => {
      console.error(error);
    },
    onCompleted: data => {
      console.log(data);
    },
  });

  const [setJamIsClosed] = useMutation(SET_JAM_ISCLOSED, {
    onError: error => {
      console.error(error);
    },
    onCompleted: data => {
      console.log(data);
    },
  })

  const handleColorChange = (color: any) => {
    setColor(color.hex);
  };

  const handleColorChangeComplete = (color: any) => {
    if (colorTimeout) {
      clearTimeout(colorTimeout);
    }
    const timeout = setTimeout(() => {
      setJamColor({
        variables: {
          jamId: props.jam.id,
          color: color.hex,
        },
      });
      setColorTimeout(null);
    }, 500);
    setColorTimeout(timeout);
  };

  const handleCloseChange = () => {
    setJamIsClosed({
      variables: {
        jamId: props.jam.id,
        isClosed: !isClosed,
      }
    });
    setIsClosed(!isClosed);
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
          <Checkbox checked={isClosed} onChange={handleCloseChange}/>
          Closed (new members require approval)
        </Box>
        <Box sx={{
          margin: 1,
          display: 'none',
          flexDirection: 'row',
        }}>
          <Checkbox />
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