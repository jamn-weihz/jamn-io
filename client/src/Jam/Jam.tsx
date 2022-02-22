import { gql, useLazyQuery, useReactiveVar } from '@apollo/client';
import { Box, Button, Card, Link } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { pathVar, sizeVar } from '../cache';
import { FULL_POST_FIELDS, JAM_FIELDS, ROLE_FIELDS, USER_FIELDS } from '../fragments';
import Loading from '../Loading';
import NotFound from '../NotFound';
import PostContainer from '../Post/PostContainer';
import { Jam } from '../types/Jam';
import JamPosts from './JamPosts';
import JamSettings from './JamSettings';
import JamUsers from './JamUsers';

const GET_JAM_BY_NAME = gql`
  query GetJamByName($name: String!) {
    getJamByName(name: $name) {
      ...JamFields
      roles {
        ...RoleFields
        user {
          ...UserFields
        }
      }
      focus {
        ...FullPostFields
      }
    }
  }
  ${JAM_FIELDS}
  ${ROLE_FIELDS}
  ${USER_FIELDS}
  ${FULL_POST_FIELDS}
`;

export default function JamComponent() {
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const pathDetail = useReactiveVar(pathVar);
  const sizeDetail = useReactiveVar(sizeVar);

  const [jam, setJam] = useState(null as Jam | null);
  const [isLoading, setIsLoading] = useState(false);
  const [show, setShow] = useState('p');

  const [getJamByName] = useLazyQuery(GET_JAM_BY_NAME, {
    onError: error => {
      console.error(error);
      setIsLoading(false);
    },
    onCompleted: data => {
      console.log(data);
      setJam(data.getJamByName);
      setIsLoading(false);
    },
  });

  useEffect(() => {
    setIsLoading(true);
    getJamByName({
      variables: {
        name: params.jamName,
      },
    });
  }, [params.jamName]);

  useEffect(() => {
    const path = location.pathname.split('/');
    if (
      path[1] === 'j' &&
      path[3] !== 'u' && 
      path[3] !== 'p' &&
      path[3] !== 's'
    ) {
      const branch = pathDetail.pathToBranch[path.slice(0,3).join('/')] || 'p';
      navigate(`/j/${path[2]}/${branch}`);
    }
  }, [location.pathname]);

  if (isLoading) return <Loading />

  if (!jam) return <NotFound />

  const handleShowUsersClick = (event:React.MouseEvent) => {
    const path = location.pathname.split('/');
    pathVar({
      pathToBranch: {
        ...pathDetail.pathToBranch,
        [path.slice(0, 3).join('/')]: 'u',
      },
    });
    navigate(`/j/${encodeURIComponent(jam.name)}/u`)
  }
  const handleShowPostsClick = (event:React.MouseEvent) => {
    const path = location.pathname.split('/');
    pathVar({
      pathToBranch: {
        ...pathDetail.pathToBranch,
        [path.slice(0, 3).join('/')]: 'p',
      },
    });
    navigate(`/j/${encodeURIComponent(jam.name)}/p`)
  }
  const handleShowSettingsClick = (event:React.MouseEvent) => {
    const path = location.pathname.split('/');
    pathVar({
      pathToBranch: {
        ...pathDetail.pathToBranch,
        [path.slice(0, 3).join('/')]: 's',
      },
    });
    navigate(`/j/${encodeURIComponent(jam.name)}/s`)
  }

  const path = location.pathname.split('/');
  
  return (
    <Box className='jam' sx={{
      //height: props.height,
    }}>
      <Card elevation={10} sx={{
        padding: 1,
        paddingLeft: 2,
        paddingRight: 2,
        fontSize: 20,
        color: jam.color,
      }}>
        j/{ jam.name }
      </Card>
      {
        path[3] === 'u'
          ? <JamUsers jam={jam} />
          : path[3] === 'p'
            ? <JamPosts jam={jam} />
            : path[3] === 's'
              ? <JamSettings jam={jam} />
              : null
      }
      <Box sx={{
        position: 'absolute',
        bottom: 0,
        width: {
          xs: '100%',
          sm: '400px',
        },
        left: {
          xs: 'initial',
          sm: '50%'
        },
        marginLeft: {
          xs: 0,
          sm: '-200px',
        },
        zIndex: 100,
        textAlign: 'center'
      }}>
        <Card elevation={5} sx={{
          margin: 1,
          padding: 1,
        }}>
          <Box sx={{
            float: 'left',
          }}>
            <Button onClick={handleShowUsersClick} sx={{
              color: path[3] === 'u' ? jam.color : 'dimgrey',
            }}>
              Users
            </Button>
          </Box>
          <Button onClick={handleShowPostsClick} sx={{
            color: path[3] === 'p' ? jam.color : 'dimgrey',
          }}>
            Posts
          </Button>
          <Box sx={{float: 'right'}}>
            <Button onClick={handleShowSettingsClick} sx={{
              color: path[3] === 's' ? jam.color : 'dimgrey',
            }}>
              Settings
            </Button>
          </Box>
        </Card>
      </Box>
    </Box>
  )
}