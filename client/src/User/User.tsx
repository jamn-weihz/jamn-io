import { gql, useApolloClient, useLazyQuery, useReactiveVar } from '@apollo/client'
import { Box, Card } from '@mui/material';
import { paletteVar, userVar } from '../cache'
import { FULL_USER_FIELDS } from '../fragments';
import { useEffect, useState } from 'react';
import NotFound from '../NotFound';
import Logout from '../Auth/Logout';
import Verify from '../Auth/Verify';
import { User } from '../types/User';
import Loading from '../Loading';
import UserJams from './UserJams';
import UserProfile from './UserProfile';
import UserSettings from './UserSettings';
import { ColUnit } from '../types/Col';
import ColLink from '../Col/ColLink';
import { getColor } from '../utils';
import ColBar from '../Col/ColBar';
import useUserRoleSubscription from '../Role/useUserRoleSubscription';
import UserRecent from './UserRecent';

const GET_USER_BY_NAME = gql`
  query GetUserByName($name: String!) {
    getUserByName(name: $name) {
      ...FullUserFields
    }
  }
  ${FULL_USER_FIELDS}
`;
interface UserProps {
  colUnit: ColUnit;
  name: string;
}
export default function UserComponent(props: UserProps) {
  const client = useApolloClient();

  const userDetail = useReactiveVar(userVar);
  const paletteDetail = useReactiveVar(paletteVar);
  const [user, setUser] = useState(null as User | null);
  const [isLoading, setIsLoading] = useState(false);

  useUserRoleSubscription(user?.id || '');
  
  const [getUserByName] = useLazyQuery(GET_USER_BY_NAME, {
    onError: error => {
      console.error(error);
      setIsLoading(false);
    },
    onCompleted: data => {
      if (isLoading) {
        console.log(data);
        setIsLoading(false);
        setUser(data.getUserByName);
      }
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

  const path = props.colUnit.col.pathname.split('/');

  const color = getColor(paletteDetail.mode);

  const user1 = client.cache.readFragment({
    id: client.cache.identify(user || {}),
    fragment: FULL_USER_FIELDS,
    fragmentName: 'FullUserFields'
  }) as User;

  return (
    <Box sx={{
      height: '100%'
    }}>
      <ColBar colUnit={props.colUnit} user={user1} />
      {
        user1?.id && user1.id === userDetail?.id
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
        user1.id
          ? <Box sx={{
              height: '100%'
            }}>
              <Card elevation={5} sx={{
                margin: 1,
                padding: 1,
                marginBottom: 0,
                borderBottom: '1px solid dimgrey',
              }}>
                <ColLink col={props.colUnit.col} pathname={`/u/${user1.name}/j`} sx={{
                  color: path[3] === 'j' 
                    ? user1.color 
                    : color,
                }}>
                  Jams
                </ColLink>
                &nbsp;&nbsp;
                <ColLink col={props.colUnit.col} pathname={`/u/${user1.name}`} sx={{
                  color: !path[3] || path[3] === '' 
                    ? user1.color 
                    : color,
                }}>
                  Profile
                </ColLink>
                &nbsp;&nbsp;
                <ColLink col={props.colUnit.col} pathname={`/u/${user1.name}/r`} sx={{
                  color: path[3] === 'r' 
                    ? user1.color 
                    : color,
                }}>
                  Recent
                </ColLink>
                &nbsp;&nbsp;
                <ColLink col={props.colUnit.col} pathname={`/u/${user1.name}/s`} sx={{
                  display: user1.id === userDetail?.id
                    ? 'initial'
                    : 'none',
                  color: path[3] === 's'
                    ? user1.color 
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
                    ? <UserJams user={user1} colUnit={props.colUnit} />
                    : path[3] === 'r'
                      ? <UserRecent user={user1} colUnit={props.colUnit} />
                      : path[3] === 's'
                        ? <UserSettings colUnit={props.colUnit} user={user1} />
                        : <UserProfile 
                            user={user1} 
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