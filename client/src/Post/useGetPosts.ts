import { gql, useMutation } from '@apollo/client';
import { FULL_POST_FIELDS } from '../fragments';

const GET_POSTS = gql`
  mutation GetPosts($postIds: [String!]!) {
    getPosts(postIds: $postIds) {
      ...FullPostFields
    }
  }
  ${FULL_POST_FIELDS}
`;

export default function useGetPosts(onCompleted?: any) {
  const [get] = useMutation(GET_POSTS, {
    onError: error => {
      console.error(error);
    },
    onCompleted: data => {
      console.log(data);
      onCompleted && onCompleted(data.getPosts);
    },
  });
  
  const getPosts = (postIds: string[]) => {
    get({
      variables: {
        postIds,
      }
    });
  };
  return { getPosts };
}