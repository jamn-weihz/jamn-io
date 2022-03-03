import { gql, useMutation } from '@apollo/client';
import { useContext } from 'react';
import { CardContext } from '../App';
import { LINK_FIELDS, VOTE_FIELDS, FULL_POST_FIELDS } from '../fragments';

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

export default function useGetNext(cardId: string, postId: string) {
  const { dispatch } = useContext(CardContext);

  const [getNextLinks] = useMutation(GET_NEXT, {
    onError: error => {
      console.error(error);
    },
    onCompleted: data => {
      console.log(data);
      dispatch({
        type: 'ADD_NEXT',
        cardId,
        outLinks: data.getNext,
      })
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