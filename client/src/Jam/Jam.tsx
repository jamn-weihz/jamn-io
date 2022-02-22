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

interface JamComponentProps {
  i: number;
  name: string;
}
export default function JamComponent(props: JamComponentProps) {
  const pathDetail = useReactiveVar(pathVar);

  const [jam, setJam] = useState(null as Jam | null);
  const [isLoading, setIsLoading] = useState(false);

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
        name: props.name,
      },
    });
  }, [props.name]);


  if (isLoading) return <Loading />

  if (!jam) return <NotFound />

  const handleShowUsersClick = (event:React.MouseEvent) => {

  }
  const handleShowPostsClick = (event:React.MouseEvent) => {

  }
  const handleShowSettingsClick = (event:React.MouseEvent) => {

  }

  return (
    <Box className='jam' sx={{
      width: 320,
      border: '1px solid lavender',
    }}>
      <Card elevation={5} sx={{
        padding: 1,
        color: jam.color,
      }}>
        j/{ jam.name }
      </Card>

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
              //color: path[3] === 'u' ? jam.color : 'dimgrey',
            }}>
              Users
            </Button>
          </Box>
          <Button onClick={handleShowPostsClick} sx={{
            //color: path[3] === 'p' ? jam.color : 'dimgrey',
          }}>
            Posts
          </Button>
          <Box sx={{float: 'right'}}>
            <Button onClick={handleShowSettingsClick} sx={{
              //color: path[3] === 's' ? jam.color : 'dimgrey',
            }}>
              Settings
            </Button>
          </Box>
        </Card>
      </Box>
    </Box>
  )
}