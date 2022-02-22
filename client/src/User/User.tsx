import { gql, useLazyQuery, useReactiveVar } from '@apollo/client'
import { Box, Button, Card, Link } from '@mui/material';
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
  i: number;
  name: string;
}
export default function UserComponent(props: UserProps) {
  const location = useLocation();
  const params = useParams();
  const navigate = useNavigate();

  const pathDetail = useReactiveVar(pathVar);
  const userDetail = useReactiveVar(userVar);

  const [user, setUser] = useState(null as User | null);
  const [isLoading, setIsLoading] = useState(false);

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


  useEffect(() => {
    const path = location.pathname.split('/');
    if (
      path[1] === 'u' &&
      path[3] !== 'j' && 
      path[3] !== 'p' &&
      path[3] !== 's'
    ) {
      const branch = pathDetail.pathToBranch[path.slice(0,3).join('/')] || 'p';
      //navigate(`/u/${path[2]}/${branch}`);
    }
  }, [location.pathname]);


  if (isLoading) return <Loading />

  if (!user) return <NotFound />

  const handleShowJamsClick = (event:React.MouseEvent) => {
    const path = location.pathname.split('/');
    pathVar({
      pathToBranch: {
        ...pathDetail.pathToBranch,
        [path.slice(0, 3).join('/')]: 'j',
      },
    });
    navigate(`/u/${encodeURIComponent(user.name)}/j`)
  }
  const handleShowPostsClick = (event:React.MouseEvent) => {
    const path = location.pathname.split('/');
    pathVar({
      pathToBranch: {
        ...pathDetail.pathToBranch,
        [path.slice(0, 3).join('/')]: 'p',
      },
    });
    navigate(`/u/${encodeURIComponent(user.name)}/p`)
  }
  const handleShowVotesClick = (event:React.MouseEvent) => {
    const path = location.pathname.split('/');
    pathVar({
      pathToBranch: {
        ...pathDetail.pathToBranch,
        [path.slice(0, 3).join('/')]: 'v',
      },
    });
    navigate(`/u/${encodeURIComponent(user.name)}/v`)
  }
  const handleShowSettingsClick = (event:React.MouseEvent) => {
    const path = location.pathname.split('/');
    pathVar({
      pathToBranch: {
        ...pathDetail.pathToBranch,
        [path.slice(0, 3).join('/')]: 's',
      },
    });
    navigate(`/u/${encodeURIComponent(user.name)}/s`)
  }

  const path = location.pathname.split('/');

  return (
    <Box sx={{
      width: 320,
      border: '1px solid lavender',
    }}>
      <Card sx={{
        padding: 1,
        color: user.color,
      }}>
        u/{ user.name }
      </Card>
      {
        user.id === userDetail?.id
          ? <Card elevation={5} sx={{
              margin: 1,
              padding: 1,
            }}>
              <Logout />
              {
                userDetail.verifyEmailDate
                  ? null
                  : <Verify />
              }
            </Card>
          : null
      }
      {
        path[3] === 'j'
          ? <UserJams user={user} />
          : path[3] === 'p'
            ? null
            : path[3] === 'v'
              ? null
              : path[3] === 's'
                  ? <UserSettings user={user} />
                  : null
      }
      <Card elevation={5} sx={{
        margin: 1,
        padding: 1,
      }}>
        <Box sx={{
          float: 'left',
        }}>
          <Button onClick={handleShowJamsClick} sx={{
            color: path[3] === 'j' ? user.color : 'dimgrey',
          }}>
            Jams
          </Button>
        </Box>
        <Button onClick={handleShowPostsClick} sx={{
          color: path[3] === 'p' ? user.color : 'dimgrey',
        }}>
          Posts
        </Button>
        &nbsp;
        <Button onClick={handleShowVotesClick} sx={{
          color: path[3] === 'v' ? user.color : 'dimgrey',
        }}>
          Votes
        </Button>
        <Box sx={{float: 'right'}}>
          <Button onClick={handleShowSettingsClick} sx={{
            color: path[3] === 's' ? user.color : 'dimgrey',
          }}>
            Settings
          </Button>
        </Box>
      </Card>
    </Box>
  )
}