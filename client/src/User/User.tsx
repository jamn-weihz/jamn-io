import { gql, useLazyQuery, useReactiveVar } from '@apollo/client'
import { Box, Card, IconButton } from '@mui/material';
import { paletteVar, userVar } from '../cache'
import { JAM_FIELDS, ROLE_FIELDS, USER_FIELDS } from '../fragments';
import React, { Dispatch, useEffect, useState } from 'react';
import NotFound from '../NotFound';
import Logout from '../Auth/Logout';
import Verify from '../Auth/Verify';
import { User } from '../types/User';
import Loading from '../Loading';
import UserJams from './UserJams';
import UserProfile from './UserProfile';
import UserSettings from './UserSettings';
import { Col } from '../types/Col';
import RemoveColButton from '../Col/RemoveColButton';
import ColLink from '../Col/ColLink';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { PostAction } from '../types/Post';
import { getColor } from '../utils';

const GET_USER_BY_NAME = gql`
  query GetUserByName($name: String!) {
    getUserByName(name: $name) {
      ...UserFields
      roles {
        ...RoleFields
        jam {
          ...JamFields
        }
      }
    }
  }
  ${USER_FIELDS}
  ${ROLE_FIELDS}
  ${JAM_FIELDS}
`;
interface UserProps {
  col: Col;
  name: string;
  postDispatch: Dispatch<PostAction>;
}
export default function UserComponent(props: UserProps) {
  const userDetail = useReactiveVar(userVar);
  const paletteDetail = useReactiveVar(paletteVar);
  const [user, setUser] = useState(null as User | null);
  const [isLoading, setIsLoading] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const [getUserByName] = useLazyQuery(GET_USER_BY_NAME, {
    onError: error => {
      console.error(error);
      setIsLoading(false);
    },
    onCompleted: data => {
      console.log(data);
      setIsLoading(false);
      setUser(data.getUserByName);
    },
    fetchPolicy: 'cache-and-network',
  });

  useEffect(() => {
    setIsLoading(true);
    getUserByName({
      variables: {
        name: props.name,
      }
    });
  }, [props.name]);

  if (isLoading) return <Loading />

  const handleOptionsClick = (event: React.MouseEvent) => {
    setShowOptions(!showOptions);
  }
  
  const path = props.col.pathname.split('/');

  const color = getColor(paletteDetail.mode);
  return (
    <Box sx={{
      height: '100%'
    }}>
      <Card elevation={5}>
        <Box sx={{
          padding: 1,
          color: user?.color || color,
          display: 'flex',
          justifyContent: 'space-between'
        }}>
          <Box>
            { props.col.pathname }
          </Box>
          <IconButton size='small' onClick={handleOptionsClick} sx={{
            color: user?.color || color,
            fontSize: 20,
            padding: 0,
          }}>
            <MoreVertIcon fontSize='inherit'/> 
          </IconButton>
        </Box>
        <Box sx={{
          display: showOptions ? 'flex' : 'none',
          padding: 1,
          borderTop: '1px solid',
          borderColor: getColor(paletteDetail.mode, true),
        }}>
          <RemoveColButton col={props.col} />
        </Box>

      </Card>
      {
        user?.id && user.id === userDetail?.id
          ? <Box>
              <Logout />
              {
                userDetail.verifyEmailDate
                  ? null
                  : <Verify />
              }
            </Box>
          : null
      }
      {
        user
          ? <Box sx={{
              height: '100%'
            }}>
              <Card elevation={5} sx={{
                margin: 1,
                padding: 1,
                marginBottom: 0,
                borderBottom: '1px solid dimgrey',
              }}>
                <ColLink col={props.col} pathname={`/u/${encodeURIComponent(user.name)}/j`} sx={{
                  color: path[3] === 'j' 
                    ? user.color 
                    : color,
                }}>
                  Jams
                </ColLink>
                &nbsp;&nbsp;
                <ColLink col={props.col} pathname={`/u/${encodeURIComponent(user.name)}`} sx={{
                  color: !path[3] || path[3] === '' 
                    ? user.color 
                    : color,
                }}>
                  Profile
                </ColLink>
                &nbsp;&nbsp;
                <ColLink col={props.col} pathname={`/u/${encodeURIComponent(user.name)}/r`} sx={{
                  color: path[3] === 'r' 
                    ? user.color 
                    : color,
                }}>
                  Recent
                </ColLink>
                &nbsp;&nbsp;
                <ColLink col={props.col} pathname={`/u/${encodeURIComponent(user.name)}/s`} sx={{
                  color: path[3] === 's'
                    ? user.color 
                    : color,
                }}>
                  Settings
                </ColLink>
              </Card>
              <Box sx={{
                height: '100%',
                overflow: 'scroll',
              }}>
                {
                  path[3] === 'j'
                    ? <UserJams user={user} col={props.col} />
                    : path[3] === 'r'
                      ? null
                      : path[3] === 's'
                        ? <UserSettings user={user} />
                        : <UserProfile 
                            user={user} 
                            col={props.col} 
                            postDispatch={props.postDispatch}
                          />
                }
              </Box>
            </Box>
          : <NotFound />
      }
     


    </Box>
  )
}