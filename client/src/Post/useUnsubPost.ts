import { gql, Reference, useApolloClient, useMutation, useReactiveVar } from '@apollo/client';
import { userVar } from '../cache';
import { FULL_USER_FIELDS, SUB_FIELDS } from '../fragments';
import { User } from '../types/User';

const UNSUB_POST = gql`
  mutation UnsubPost($postId: String!) {
    unsubPost(postId: $postId) {
      ...SubFields
    }
  }
  ${SUB_FIELDS}
`

export default function useUnsubPost(postId: string) {
  const client = useApolloClient();
  const userDetail = useReactiveVar(userVar);

  const [unsub] = useMutation(UNSUB_POST, {
    onError: error => {
      console.error(error);
    },
    update: (cache, {data: {unsubPost}}) => {
      cache.modify({
        id: cache.identify(userDetail || {}),
        fields: {
          subs: (cachedRefs, {readField}) => cachedRefs
            .filter((ref: Reference) => readField('id', ref) !== unsubPost.id),
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

  const unsubPost = () => {
    unsub({
      variables: {
        postId, 
      }
    });
  }

  return { unsubPost }
}
