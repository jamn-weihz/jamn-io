import { gql, useApolloClient, useLazyQuery, useReactiveVar } from '@apollo/client';
import { Box, Card } from '@mui/material';
import { useEffect, useState } from 'react';
import { FULL_JAM_FIELDS } from '../fragments';
import Loading from '../Loading';
import { ColUnit } from '../types/Col';
import { Jam } from '../types/Jam';
import { Role } from '../types/Role';
import JamProfile from './JamProfile';
import JamSettings from './JamSettings';
import JamUsers from './JamUsers';
import ColLink from '../Col/ColLink';
import JamRecent from './JamRecent';
import { userVar, paletteVar, startJamVar } from '../cache';
import { getColor } from '../utils'
import ColBar from '../Col/ColBar';
import useJamRoleSubscription from '../Role/useJamRoleSubscription';
import useSetJamSubscription from './useSetJamSubscription';
import NotFound from '../NotFound';

const GET_JAM_BY_NAME = gql`
  query GetJamByName($name: String!) {
    getJamByName(name: $name) {
      ...FullJamFields
    }
  }
  ${FULL_JAM_FIELDS}
`;

interface JamComponentProps {
  colUnit: ColUnit;
  name: string;
}
export default function JamComponent(props: JamComponentProps) {
  const client = useApolloClient();

  const userDetail = useReactiveVar(userVar);
  const paletteDetail = useReactiveVar(paletteVar);
  const startJamDetail = useReactiveVar(startJamVar);

  const [jam, setJam] = useState(null as Jam | null);
  const [isLoading, setIsLoading] = useState(false);

  useSetJamSubscription(jam?.id || '');
  useJamRoleSubscription(jam?.id || '');

  const [getJamByName] = useLazyQuery(GET_JAM_BY_NAME, {
    onError: error => {
      console.error(error);
      setIsLoading(false);
    },
    onCompleted: data => {
      if (isLoading) {
        console.log(data);
        setJam(data.getJamByName);
        setIsLoading(false);
      }
    },
  });

  useEffect(() => {
    setIsLoading(true);
    if (startJamDetail.jam && startJamDetail.jam.name === props.name) {
      setJam(startJamDetail.jam);
      startJamVar({
        jam: null,
      })
    }
    else {
      getJamByName({
        variables: {
          name: props.name,
        },
      });
    }

  }, [startJamDetail.jam, props.name]);

  if (isLoading) return <Loading />

  const jam1 = client.cache.readFragment({
    id: client.cache.identify(jam || {}),
    fragment: FULL_JAM_FIELDS,
    fragmentName: 'FullJamFields',
  }) as Jam;

  let role = null as Role | null;
  (jam1.roles || []).some(role_i => {
    if (role_i.userId === userDetail?.id) {
      role = role_i;
      return true;
    }
    return false;
  })

  const path = props.colUnit.col.pathname.split('/');

  const color = getColor(paletteDetail.mode);
  return (
    <Box sx={{
      height: '100%'
    }}>
      <ColBar colUnit={props.colUnit} jam={jam1} />
      {
        jam1.id
          ? <Box sx={{
              height: '100%'
            }}>
              <Card elevation={5} sx={{
                margin: 1,
                padding: 1,
                marginBottom: 0,
                borderBottom: '1px solid dimgrey',
              }}>
                <ColLink col={props.colUnit.col} pathname={`/j/${jam1.name}/u`} sx={{
                  color: path[3] === 'u' ? jam1.color : color,
                }}>
                  Users
                </ColLink>
                &nbsp;&nbsp;
                <ColLink col={props.colUnit.col} pathname={`/j/${jam1.name}`} sx={{
                  color: !path[3] || path[3] === '' ? jam1.color : color,
                }}>
                  Profile
                </ColLink>
                &nbsp;&nbsp;
                <ColLink col={props.colUnit.col} pathname={`/j/${jam1.name}/r`} sx={{
                  color: path[3] === 'r' ? jam1.color : color,
                }}>
                  Recent
                </ColLink>
                &nbsp;&nbsp;
                <ColLink col={props.colUnit.col} pathname={`/j/${jam1.name}/s`} sx={{
                  display: role && role.type === 'ADMIN'
                    ? 'initial'
                    : 'none',
                  color: path[3] === 's' ? jam1.color : color,
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
                    ? <JamUsers jam={jam1} colUnit={props.colUnit}/>
                    : path[3] === 'r'
                      ? <JamRecent jam={jam1} colUnit={props.colUnit} />
                      : path[3] === 's'
                        ? <JamSettings jam={jam1} colUnit={props.colUnit}/>
                        : <JamProfile 
                            jam={jam1} 
                            colUnit={props.colUnit} 
                          />
                }
              </Box>
            </Box>
          : <NotFound />
      }
    </Box>
  )
}