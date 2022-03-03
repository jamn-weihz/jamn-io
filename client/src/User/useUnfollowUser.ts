import { gql, Reference, useApolloClient, useMutation, useReactiveVar } from '@apollo/client';
import { userVar } from '../cache';
import { FULL_USER_FIELDS, LEAD_FIELDS } from '../fragments';
import { User } from '../types/User';

const UNFOLLOW_USER = gql`
  mutation UnollowUser($userId: String!) {
    unfollowUser(userId: $userId) {
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
export default function useUnfollowUser(){
  const client = useApolloClient();

  const userDetail = useReactiveVar(userVar);

  const [unfollow] = useMutation(UNFOLLOW_USER, {
    onError: error => {
      console.error(error);
    },
    update:  (cache, {data: {unfollowUser}}) => {
      cache.modify({
        id: cache.identify(userDetail || {}),
        fields: {
          leaders: (cachedRefs, {readField}) => cachedRefs
            .filter((ref: Reference) => readField('id', ref) !== unfollowUser.id),
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

  const unfollowUser = (userId: string) => {
    unfollow({
      variables: {
        userId,
      }
    });
  }
  return { unfollowUser }
}