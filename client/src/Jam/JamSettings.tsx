import { gql, useMutation } from '@apollo/client';
import { Box } from '@mui/material';
import { useState } from 'react';
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


interface JamSettingsProps {
  jam: Jam;
  col: Col;
}

export default function JamSettings(props: JamSettingsProps) {
  const [color, setColor] = useState(props.jam.color);

  const [colorTimeout, setColorTimeout] = useState(null as ReturnType<typeof setTimeout> | null);

  const [setJamColor] = useMutation(SET_JAM_COLOR, {
    onError: error => {
      console.error(error);
    },
    onCompleted: data => {
      console.log(data);
    },
  });

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

  return (
    <Box>
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

    </Box>
  )
}