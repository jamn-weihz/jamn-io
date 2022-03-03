import { Box, Button, Card } from '@mui/material'
import { Jam } from '../types/Jam'
import ColLink from '../Col/ColLink';
import { ColUnit } from '../types/Col';
import { useReactiveVar } from '@apollo/client';
import { paletteVar, userVar } from '../cache';
import { getColor } from '../utils';
import React, { useState } from 'react';
import InviteRoleForm from './InviteRoleForm';
import { Role } from '../types/Role';
import useRequestRole from '../Role/useRequestRole';
import useInviteRole from '../Role/useInviteRole';
import useRemoveRole from '../Role/useRemoveRole';

interface JamUsersProps {
  jam: Jam;
  colUnit: ColUnit;
}

export default function JamUsers(props: JamUsersProps) {
  const userDetail = useReactiveVar(userVar);
  const paletteDetail = useReactiveVar(paletteVar);
  
  const [isInviting, setIsInviting] = useState(false);

  const { requestRole } = useRequestRole();
  const { inviteRole } = useInviteRole(props.jam.id, () => {});
  const { removeRole } = useRemoveRole();

  const handleInviteClick = (event: React.MouseEvent) => {
    setIsInviting(true);
  }
  const handleJoinClick = (event: React.MouseEvent) => {
    requestRole(props.jam.id);
  }
  const handleApproveClick = (userName: string) => (event: React.MouseEvent) => {
    inviteRole(userName);
  }
  const handleLeaveClick = (roleId: string) => (event: React.MouseEvent) => {
    removeRole(roleId)
  }

  let role = null as Role | null;
  props.jam.roles.filter(role_i => !role_i.deleteDate).some(role_i => {
    if (role_i.userId === userDetail?.id) {
      role = role_i;
      return true;
    }
    return false;
  });
  
  return (
    <Box>
      <Card elevation={5} sx={{
        margin: 1,
        padding: 1,
      }}>
        {
          role && role.isInvited && role.isRequested
            ? <Box>
                {
                  isInviting 
                    ? <Box>
                        <InviteRoleForm jam={props.jam} setIsInviting={setIsInviting}/>
                      </Box>
                    : <Button variant='contained' onClick={handleInviteClick}>
                        Invite
                      </Button>
                }
              </Box>
            : <Box>
                {
                  !props.jam.isClosed || (role && role.isInvited)
                    ? <Button disabled={!userDetail} variant='contained' onClick={handleJoinClick}>
                        Join
                      </Button>
                    : <Button disabled={!userDetail} onClick={handleJoinClick}>
                        Request membership
                      </Button>
                }
              </Box>
        }
      </Card>
      <Box sx={{
        height: 'calc(100% - 120px)',
        overflow: 'scroll',
      }}>
        {
          (props.jam.roles || []).filter(role_i => !role_i.deleteDate).map(role_i => {
            return (
              <Card key={`role-${role_i.id}-${props.colUnit.col.id}`} elevation={5} sx={{
                margin:1,
                padding:1,
                fontSize: 16,
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between'
              }}>
                <Box>
                  <ColLink col={props.colUnit.col} pathname={`/u/${role_i.user.name}`} sx={{
                    color: role_i.user.color,
                  }}>
                    { `u/${role_i.user.name}` }
                  </ColLink>
                  <Box sx={{
                    marginTop:1,
                    fontSize: 12,
                    color: getColor(paletteDetail.mode),
                  }}>
                    { role_i.isInvited && role_i.isRequested
                        ? role_i.type
                        : role_i.isInvited
                          ? 'INVITED'
                          : 'REQUESTED'
                    }
                  </Box>
                </Box>
                <Box sx={{
                  display: role && role.isInvited && role.isRequested && !role_i.isInvited
                    ? 'block'
                    :'none'
                }}>
                  <Button onClick={handleApproveClick(role_i.user.name)}>
                    Approve
                  </Button>
                </Box>
                <Box sx={{
                  display: role_i.userId === userDetail?.id && role_i.type !== 'ADMIN'
                    ? 'block'
                    : 'none'
                }}>
                  {
                    role_i.isRequested
                      ? role_i.isInvited
                        ? <Button onClick={handleLeaveClick(role_i.id)}>
                            Leave
                          </Button>
                        : <Button onClick={handleLeaveClick(role_i.id)}>
                            Cancel
                          </Button>
                      : role_i.isInvited
                        ? <Box>
                          <Button onClick={handleJoinClick}>
                            Accept
                          </Button>
                          <Button onClick={handleLeaveClick(role_i.id)}>
                            Decline
                          </Button>
                          </Box>
                        : null
                  }
                  
                </Box>
              </Card>
            )
          })
        }
      </Box>
    </Box>
  )
}