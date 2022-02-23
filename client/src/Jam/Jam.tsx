import { gql, useLazyQuery } from '@apollo/client';
import { Box, Card, IconButton } from '@mui/material';
import React, { Dispatch, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FULL_POST_FIELDS, JAM_FIELDS, ROLE_FIELDS, USER_FIELDS } from '../fragments';
import Loading from '../Loading';
import NotFound from '../NotFound';
import { Col } from '../types/Col';
import { Jam } from '../types/Jam';
import JamProfile from './JamProfile';
import JamSettings from './JamSettings';
import JamUsers from './JamUsers';
import ColRemovalButton from '../Col/ColRemovalButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import useChangeCol from '../Col/useChangeCol';
import ColLink from '../Col/ColLink';
import JamnRecent from './JamRecent';
import { PostAction } from '../types/Post';
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
  col: Col;
  name: string;
  postDispatch: Dispatch<PostAction>;
}
export default function JamComponent(props: JamComponentProps) {
  const navigate  = useNavigate();

  const [jam, setJam] = useState(null as Jam | null);
  const [isLoading, setIsLoading] = useState(false);

  const [showOptions, setShowOptions] = useState(false);

  const { changeCol } = useChangeCol();

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

  const handleOptionsClick = (event: React.MouseEvent) => {
    setShowOptions(!showOptions);
  }

  const path = props.col.pathname.split('/');

  return (
    <Box sx={{
      height: '100%'
    }}>
      <Card elevation={5} sx={{
        color: jam.color,
        borderBottom: '1px solid dimgrey',
      }}>
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: 1,
        }}>
          <Box>
            j/{ jam.name }
          </Box>
          <IconButton size='small' onClick={handleOptionsClick} sx={{
            color: jam.color,
            fontSize: 20,
            padding: 0,
          }}>
            <MoreVertIcon fontSize='inherit'/> 
          </IconButton>
        </Box>
        <Box sx={{
          display: showOptions ? 'block' : 'none',
          color: 'dimgrey',
          borderTop: '1px solid lavender',
          padding: 1,
        }}>
          <ColRemovalButton col={props.col}/>
        </Box>
      </Card>
      <Card elevation={5} sx={{
        margin: 1,
        padding: 1,
        marginBottom: 0,
        borderBottom: '1px solid dimgrey',
      }}>
        <ColLink col={props.col} pathname={`/j/${encodeURIComponent(jam.name)}/u`} sx={{
          color: path[3] === 'u' ? jam.color : 'dimgrey',
          cursor: 'pointer',
        }}>
          Users
        </ColLink>
        &nbsp;&nbsp;
        <ColLink col={props.col} pathname={`/j/${encodeURIComponent(jam.name)}`} sx={{
          color: !path[3] || path[3] === '' ? jam.color : 'dimgrey',
          cursor: 'pointer',
        }}>
          Profile
        </ColLink>
        &nbsp;&nbsp;
        <ColLink col={props.col} pathname={`/j/${encodeURIComponent(jam.name)}/r`} sx={{
          color: path[3] === 'r' ? jam.color : 'dimgrey',
          cursor: 'pointer',
        }}>
          Recent
        </ColLink>
        &nbsp;&nbsp;
        <ColLink col={props.col} pathname={`/j/${encodeURIComponent(jam.name)}/s`} sx={{
          color: path[3] === 's' ? jam.color : 'dimgrey',
          cursor: 'pointer',
        }}>
          Settings
        </ColLink>
      </Card>
      <Box sx={{
        height: '100%',
        overflow: 'scroll',
      }}>
        {
           path[3] === 'u'
            ? <JamUsers jam={jam} col={props.col}/>
            : path[3] === 'r'
              ? <JamnRecent jam={jam} col={props.col} />
              : path[3] === 's'
                ? <JamSettings jam={jam} col={props.col}/>
                : <JamProfile jam={jam} col={props.col} postDispatch={props.postDispatch} />
        }
      </Box>
    </Box>
  )
}