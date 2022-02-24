import { useReactiveVar } from '@apollo/client';
import { Box, Card, Link } from '@mui/material'
import { useNavigate } from 'react-router-dom';
import { paletteVar } from '../cache';
import ColLink from '../Col/ColLink';
import useChangeCol from '../Col/useChangeCol';
import { Col } from '../types/Col';
import { User } from '../types/User'
import { getColor } from '../utils';

interface UserJamsProps {
  col: Col;
  user: User;
}
export default function UserJams(props: UserJamsProps) {
  const paletteDetail = useReactiveVar(paletteVar);
  
  return (
    <Box>
      {
        props.user.roles.map(role => {
          return (
            <Card elevation={5} key={`role-${role.id}`} sx={{
              margin:1,
              padding:1,
              fontSize: 16,
            }}>
              <ColLink col={props.col} pathname={`/j/${encodeURIComponent(role.jam.name)}`} sx={{
                color: role.jam.color,
              }}>
                {`j/${role.jam.name}`}
              </ColLink>
              <Box sx={{
                fontSize: 12,
                color: getColor(paletteDetail.mode),
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