import { gql, useLazyQuery, useMutation } from '@apollo/client';
import { LINK_FIELDS, VOTE_FIELDS, FULL_POST_FIELDS } from '../fragments';
import { Link } from '../types/Link';

const GET_PREV = gql`
  mutation GetPrev($postId: String!, $offset: Int!) {
    getPrev(postId: $postId, offset: $offset) {
      ...LinkFields
      sourcePost {
        ...FullPostFields
      }
      targetPost {
        id
        prevCount
      }
      votes {
        ...VoteFields
      }
    }
  }
  ${LINK_FIELDS}
  ${FULL_POST_FIELDS}
  ${VOTE_FIELDS}
`;

type HandleCompleted = (links: Link[]) => void;

export default function useGetPrev(postId: string, handleCompleted: HandleCompleted) {
  const [getPrevLinks] = useMutation(GET_PREV, {
    onError: error => {
      console.error(error);
    },
    onCompleted: data => {
      console.log(data);
      handleCompleted(data.getPrev);
    },
    fetchPolicy: 'network-only',
  });

  const getPrev = (offset: number) => {
    getPrevLinks({
      variables: {
        postId,
        offset,
      }
    });
  }
  return { getPrev }
}