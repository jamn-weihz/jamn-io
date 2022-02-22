import { useReactiveVar } from "@apollo/client";
import { Box, Button, Card } from "@mui/material";
import { Dispatch, SetStateAction } from "react";
import { useNavigate } from "react-router-dom";
import { userVar } from "../cache";

interface MapControlsProps {
  setIsStartingJam: Dispatch<SetStateAction<boolean>>;
}
export default function MapControls(props: MapControlsProps) {
  const navigate = useNavigate();

  const userDetail = useReactiveVar(userVar);

  const handleJamClick = (event: React.MouseEvent) => {
    if (userDetail.user?.id) {
      if (userDetail.user?.verifyEmailDate) {
        props.setIsStartingJam(true);
      }
      else {
        navigate(`/u/${encodeURIComponent(userDetail.user.name)}`)
      }
    }
    else{
      navigate('/register');
    }
  };

  return (
    <Box sx={{
      position: 'absolute',
      bottom: 0,
      width: {
        xs: '100%',
        sm: '400px',
      },
      left: {
        xs: 'initial',
        sm: '50%'
      },
      marginLeft: {
        xs: '0',
        sm: '-200px',
      },
      zIndex: 100,
    }}>
      <Card sx={{
        margin: 1,
        padding: 1,
        textAlign: 'center',
        display: 'flex',
        justifyContent: 'space-between',
      }}>
        <Button onClick={handleJamClick}>
          Start a jam
        </Button>
        <Button disabled={true}>
          Set your location
        </Button>
      </Card>
    </Box>
  )
}