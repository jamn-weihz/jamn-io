import { Box, Card, Link } from '@mui/material'
import { Jam } from '../types/Jam'
import { useNavigate } from 'react-router-dom';

interface JamUsersProps {
  jam: Jam;
}
export default function JamUsers(props: JamUsersProps) {
  const navigate = useNavigate();

  const handleUserClick = (userName: string) => (event: React.MouseEvent) => {
    navigate(`/u/${encodeURIComponent(userName)}`);
  }

  return (
    <Box>
      {
        (props.jam.roles || []).map(role => {
          return (
            <Card key={`role-${role.id}`} elevation={5} sx={{
              margin:1,
              padding:1,
              fontSize: 16,
            }}>
              <Link onClick={handleUserClick(role.user.name)} sx={{
                cursor: 'pointer',
                color: role.user.color,
              }}>
                u/{ role.user.name }
              </Link>
              <Box sx={{
                marginTop:1,
                fontSize: 12,
                color: 'dimgrey'
              }}>
                { role.type }
              </Box>
            </Card>
          )
        })
      }
    </Box>
  )
}