import { gql, useApolloClient, useMutation, useReactiveVar } from '@apollo/client';
import { userVar } from '../cache';
import { FULL_USER_FIELDS, LEAD_FIELDS } from '../fragments';
import { User } from '../types/User';

const FOLLOW_USER = gql`
  mutation FollowUser($userId: String!) {
    followUser(userId: $userId) {
      ...LeadFields
      leaderUser {
        id
        name
        color
      }
    }
  }
  ${LEAD_FIELDS}
`;
export default function useFollowUser(){
  const client = useApolloClient();
  const userDetail = useReactiveVar(userVar);

  const [follow] = useMutation(FOLLOW_USER, {
    onError: error => {
      console.error(error);
    },
    update:  (cache, {data: {followUser}}) => {
      const newRef = cache.writeFragment({
        id: cache.identify(followUser),
        fragment: LEAD_FIELDS,
        data: followUser,
      });
      cache.modify({
        id: cache.identify(userDetail || {}),
        fields: {
          leaders: cachedRefs => [...cachedRefs, newRef],
        },
      });
    },
    onCompleted: data => {
      console.log(data);
      const user = client.cache.readFragment({
        id: client.cache.identify(userDetail || {}),
        fragment: FULL_USER_FIELDS,
        fragmentName: 'FullUserFields',
      }) as User;
      userVar(user);
    },
  });

  const followUser = (userId: string) => {
    follow({
      variables: {
        userId,
      }
    });
  }
  return { followUser }
}