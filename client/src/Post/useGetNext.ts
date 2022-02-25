import { gql, useMutation, useReactiveVar } from '@apollo/client';
import { useContext } from 'react';
import { ItemContext } from '../App';
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

export default function useGetNext(itemId: string, postId: string) {
  const { dispatch } = useContext(ItemContext);

  const [getNextLinks] = useMutation(GET_NEXT, {
    onError: error => {
      console.error(error);
    },
    onCompleted: data => {
      console.log(data);
      dispatch({
        type: 'ADD_NEXT',
        itemId,
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