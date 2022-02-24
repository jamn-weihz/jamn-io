import { Box, Card, Link } from '@mui/material'
import { Jam } from '../types/Jam'
import { useNavigate } from 'react-router-dom';
import ColLink from '../Col/ColLink';
import { Col } from '../types/Col';
import { useReactiveVar } from '@apollo/client';
import { paletteVar } from '../cache';
import { getColor } from '../utils';

interface JamUsersProps {
  jam: Jam;
  col: Col;
}
export default function JamUsers(props: JamUsersProps) {
  const paletteDetail = useReactiveVar(paletteVar);

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
              <ColLink col={props.col} pathname={`/u/${encodeURIComponent(role.user.name)}`} sx={{
                color: role.user.color,
              }}>
                { `u/${role.user.name}` }
              </ColLink>
              <Box sx={{
                marginTop:1,
                fontSize: 12,
                color: getColor(paletteDetail.mode),
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