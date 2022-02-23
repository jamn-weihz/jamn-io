import { Box, Card, Link } from '@mui/material'
import { useNavigate } from 'react-router-dom';
import useChangeCol from '../Col/useChangeCol';
import { Col } from '../types/Col';
import { User } from '../types/User'

interface UserJamsProps {
  col: Col;
  user: User;
}
export default function UserJams(props: UserJamsProps) {
  const navigate = useNavigate();
  const { changeCol } = useChangeCol();

  const handleJamClick = (jamName: string) => (event: React.MouseEvent) => {
    const pathname = `/j/${encodeURIComponent(jamName)}`;
    changeCol(props.col, pathname);
    navigate(pathname);
  }
  
  return (
    <Box>
      {
        props.user.roles.map(role => {
          return (
            <Card key={`role-${role.id}`} sx={{
              margin:1,
              padding:1,
              fontSize: 16,
            }}>
              <Link onClick={handleJamClick(role.jam.name)} sx={{
                cursor: 'pointer',
                color: role.jam.color,
              }}>
                j/{ role.jam.name }
              </Link>
              <Box sx={{
                fontSize: 12,
                color: 'dimgrey',
                marginTop: 1,
              }}>
                {role.type}
              </Box>
            </Card>
          )
        })
      }
    </Box>
  )
}