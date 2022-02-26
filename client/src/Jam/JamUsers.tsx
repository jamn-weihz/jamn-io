import { Box, Button, Card } from '@mui/material'
import { Jam } from '../types/Jam'
import ColLink from '../Col/ColLink';
import { Col } from '../types/Col';
import { gql, Reference, useMutation, useReactiveVar } from '@apollo/client';
import { paletteVar, userVar } from '../cache';
import { getColor } from '../utils';
import React, { useState } from 'react';
import InviteRoleForm from './InviteRoleForm';
import { Role } from '../types/Role';
import { ROLE_FIELDS } from '../fragments';

const REQUEST_ROLE = gql`
  mutation RequestRole($jamId: String!) {
    requestRole(jamId: $jamId) {
      ...RoleFields
      user {
        id
        name
        color
      }
    }
  }
  ${ROLE_FIELDS}
`;

interface JamUsersProps {
  jam: Jam;
  col: Col;
}

export default function JamUsers(props: JamUsersProps) {
  const userDetail = useReactiveVar(userVar);
  const paletteDetail = useReactiveVar(paletteVar);
  
  const [isInviting, setIsInviting] = useState(false);

  const [requestRole] = useMutation(REQUEST_ROLE, {
    onError: error => {
      console.error(error);
    },
    update: (cache, {data: {requestRole}}) => {
      const newRef = cache.writeFragment({
        id: cache.identify(requestRole),
        fragment: ROLE_FIELDS,
        data: requestRole,
      });
      cache.modify({
        id: cache.identify(props.jam),
        fields: {
          roles: (cachedRefs, {readField}) => {
            const isPresent = cachedRefs.some((ref: Reference) => {
              return readField('id', ref) === requestRole.id;
            })
            if (isPresent) return cachedRefs;
            return [...cachedRefs, newRef]
          },
        }
      });
      cache.modify({
        id: cache.identify(userDetail || {}),
        fields: {
          roles: (cachedRefs, {readField}) => {
            const isPresent = cachedRefs.some((ref: Reference) => {
              return readField('id', ref) === requestRole.id;
            })
            if (isPresent) return cachedRefs;
            return [...cachedRefs, newRef]
          }
        }
      })
    },
    onCompleted: data => {
      console.log(data);

    },
  });

  const handleInviteClick = (event: React.MouseEvent) => {
    setIsInviting(true);
  }
  const handleJoinClick = (event: React.MouseEvent) => {
    requestRole({
      variables: {
        jamId: props.jam.id,
      },
    });
  }
  let role = null as Role | null;
  props.jam.roles.some(role_i => {
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
                  props.jam.isOpen || (role && role.isInvited)
                    ? <Button variant='contained' onClick={handleJoinClick}>
                        Join
                      </Button>
                    : null
                }
              </Box>
        }
      </Card>
      {
        (props.jam.roles || []).map(role_i => {
          return (
            <Card key={`role-${role_i.id}`} elevation={5} sx={{
              margin:1,
              padding:1,
              fontSize: 16,
            }}>
              <Box sx={{
                float: 'left',
              }}>
                <ColLink col={props.col} pathname={`/u/${role_i.user.name}`} sx={{
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
                float: 'right',
              }}>
                {
                  role && role.isInvited && role.isRequested && !role_i.isInvited && false
                    ? <Button>
                          Approve
                      </Button>
                    : null
                }
              </Box>
            </Card>
          )
        })
      }
    </Box>
  )
}