import { gql, useMutation } from '@apollo/client';
import { LINK_FIELDS, VOTE_FIELDS, FULL_POST_FIELDS } from '../fragments';
import { Link } from '../types/Link';

const GET_NEXT = gql`
  mutation GetNext($postId: String!, $offset: Int!) {
    getNext(postId: $postId, offset: $offset) {
      ...LinkFields
      sourcePost {
        id
        nextCount
      }
      targetPost {
        ...FullPostFields
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

export default function useGetNext(postId: string, handleCompleted: HandleCompleted) {
  const [getNextLinks] = useMutation(GET_NEXT, {
    onError: error => {
      console.error(error);
    },
    onCompleted: data => {
      console.log(data);
      handleCompleted(data.getNext);
    },
    fetchPolicy: 'network-only',
  });

  const getNext = (offset: number) => {
    getNextLinks({
      variables: {
        postId,
        offset,
      }
    });
  }
  return { getNext }
}