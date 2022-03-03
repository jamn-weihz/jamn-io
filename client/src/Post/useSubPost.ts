import { gql, useApolloClient, useMutation, useReactiveVar } from '@apollo/client';
import { userVar } from '../cache';
import { FULL_USER_FIELDS, SUB_FIELDS } from '../fragments';
import { User } from '../types/User';

const SUB_POST = gql`
  mutation SubPost($postId: String!) {
    subPost(postId: $postId) {
      ...SubFields
    }
  }
  ${SUB_FIELDS}
`

export default function useSubPost(postId: string) {
  const client = useApolloClient();

  const userDetail = useReactiveVar(userVar);

  const [sub] = useMutation(SUB_POST, {
    onError: error => {
      console.error(error);
    },
    update: (cache, {data: {subPost}}) => {
      const newRef = cache.writeFragment({
        id: cache.identify(subPost),
        fragment: SUB_FIELDS,
        data: subPost,
      });
      cache.modify({
        id: cache.identify(userDetail || {}),
        fields: {
          subs: cachedRefs => [...cachedRefs, newRef],
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

  const subPost = () => {
    sub({
      variables: {
        postId, 
      }
    });
  }

  return { subPost }
}
