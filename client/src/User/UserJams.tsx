import { useReactiveVar } from '@apollo/client';
import { Box, Button, Card } from '@mui/material'
import React from 'react';
import { paletteVar, userVar } from '../cache';
import ColLink from '../Col/ColLink';
import useRemoveRole from '../Role/useRemoveRole';
import useRequestRole from '../Role/useRequestRole';
import { ColUnit } from '../types/Col';
import { User } from '../types/User'
import { getColor } from '../utils';

interface UserJamsProps {
  colUnit: ColUnit;
  user: User;
}
export default function UserJams(props: UserJamsProps) {
  const userDetail = useReactiveVar(userVar);
  const paletteDetail = useReactiveVar(paletteVar);
  const { requestRole } = useRequestRole();
  const { removeRole } = useRemoveRole();

  const handleAcceptClick = (jamId: string) => (event: React.MouseEvent) => {
    requestRole(jamId);
  }
  const handleDeclineClick = (roleId: string) => (evnet: React.MouseEvent) => {
    removeRole(roleId);
  }
  return (
    <Box sx={{
      height: userDetail?.id === props.user.id
        ? 'calc(100% - 150px)'
        : 'calc(100% - 110px)',
      overflowY: 'scroll',
    }}>
      {
        props.user.roles.filter(role => !role.deleteDate).map(role => {
          return (
            <Card elevation={5} key={`role-${role.id}-${props.colUnit.col.id}`} sx={{
              margin:1,
              padding:1,
              fontSize: 16,
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}>
              <Box>
                <ColLink col={props.colUnit.col} pathname={`/j/${role.jam.name}`} sx={{
                  color: role.jam.color,
                }}>
                  {`j/${role.jam.name}`}
                </ColLink>
                <Box sx={{
                  fontSize: 12,
                  color: getColor(paletteDetail.mode),
                  marginTop: 1,
                }}>
                  {
                    role.isInvited && role.isRequested
                      ? role.type
                      : role.isInvited
                        ? 'INVITED'
                        : 'REQUESTED'
                  }
                </Box>
              </Box>
              <Box sx={{
                display: !role.isRequested
                  ? 'block'
                  : 'none',
              }}>
                <Button onClick={handleAcceptClick(role.jamId)}>
                  Accept
                </Button>
                <Button onClick={handleDeclineClick(role.id)}>
                  Decline
                </Button>
              </Box>
              <Box sx={{
                display: !role.isInvited
                  ? 'block'
                  : 'none',
              }}>
                <Button onClick={handleDeclineClick(role.id)}>
                  Cancel
                </Button>
              </Box>
              <Box sx={{
                display: role.isInvited && role.isRequested && role.type !== 'ADMIN'
                  ? 'block'
                  : 'none',
              }}>
                <Button onClick={handleDeclineClick(role.id)}>
                  Leave
                </Button>
              </Box>
            </Card>
          )
        })
      }
    </Box>
  )
}