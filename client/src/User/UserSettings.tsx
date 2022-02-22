import { gql, useMutation } from '@apollo/client';
import { Box } from '@mui/material';
import { useState } from 'react';
import { ChromePicker } from 'react-color';
import { User } from '../types/User';

const SET_USER_COLOR = gql`
  mutation SetUserColor($color: String!) {
    setUserColor(color: $color) {
      id
      color
    }
  }
`;


interface UserSettingsProps {
  user: User;
}

export default function UserSettings(props: UserSettingsProps) {
  const [color, setColor] = useState(props.user.color);

  const [colorTimeout, setColorTimeout] = useState(null as ReturnType<typeof setTimeout> | null);

  const [setUserColor] = useMutation(SET_USER_COLOR, {
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
      setUserColor({
        variables: {
          userId: props.user.id,
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