import { gql, useLazyQuery, useReactiveVar } from '@apollo/client'
import { Box, Button, Card, IconButton, Link } from '@mui/material';
import { pathVar, userVar } from '../cache'
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { JAM_FIELDS, ROLE_FIELDS, USER_FIELDS } from '../fragments';
import React, { useEffect, useState } from 'react';
import NotFound from '../NotFound';
import Logout from '../Auth/Logout';
import Verify from '../Auth/Verify';
import { User } from '../types/User';
import Loading from '../Loading';
import UserJams from './UserJams';
import UserPosts from './UserPosts';
import UserSettings from './UserSettings';
import { Col } from '../types/Col';
import CloseIcon from '@mui/icons-material/Close';
import ColRemovalButton from '../Col/ColRemovalButton';
import useChangeCol from '../Col/useChangeCol';
import ColLink from '../Col/ColLink';
import MoreVertIcon from '@mui/icons-material/MoreVert';

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
}
export default function UserComponent(props: UserProps) {
  const userDetail = useReactiveVar(userVar);

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
    }
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

  if (!user) return <NotFound />

  const handleOptionsClick = (event: React.MouseEvent) => {
    setShowOptions(!showOptions);
  }
  
  const path = props.col.pathname.split('/');

  return (
    <Box>
      <Card elevation={5}>
        <Box sx={{
          padding: 1,
          color: user.color,
          display: 'flex',
          justifyContent: 'space-between'
        }}>
          <Box>
            u/{ user.name }
          </Box>
          <IconButton size='small' onClick={handleOptionsClick} sx={{
            color: user.color,
            fontSize: 20,
            padding: 0,
          }}>
            <MoreVertIcon fontSize='inherit'/> 
          </IconButton>
        </Box>
        <Box sx={{
          display: showOptions ? 'flex' : 'none',
          padding: 1,
          borderTop: '1px solid lavender',
        }}>
          <ColRemovalButton col={props.col} />
        </Box>

      </Card>
      {
        user.id === userDetail?.id
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
      <Card elevation={5} sx={{
        margin: 1,
        padding: 1,
      }}>
        <ColLink col={props.col} pathname={`/u/${encodeURIComponent(user.name)}/j`} sx={{
          color: path[3] === 'j' ? user.color : 'dimgrey',
          cursor: 'pointer',
        }}>
          Jams
        </ColLink>
        &nbsp;&nbsp;
        <ColLink col={props.col} pathname={`/u/${encodeURIComponent(user.name)}/p`} sx={{
          color: path[3] === 'p' ? user.color : 'dimgrey',
          cursor: 'pointer',
        }}>
          Posts
        </ColLink>
        &nbsp;&nbsp;
        <ColLink col={props.col} pathname={`/u/${encodeURIComponent(user.name)}/v`} sx={{
          color: path[3] === 'v' ? user.color : 'dimgrey',
          cursor: 'pointer',
        }}>
          Votes
        </ColLink>
        &nbsp;&nbsp;
        <ColLink col={props.col} pathname={`/u/${encodeURIComponent(user.name)}/s`} sx={{
          color: path[3] === 's' ? user.color : 'dimgrey',
          cursor: 'pointer',
        }}>
          Settings
        </ColLink>
      </Card>
      {
        path[3] === 'j'
          ? <UserJams user={user} col={props.col} />
          : path[3] === 'p'
            ? null
            : path[3] === 'v'
              ? null
              : path[3] === 's'
                  ? <UserSettings user={user} />
                  : null
      }
    </Box>
  )
}