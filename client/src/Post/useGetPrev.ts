import { gql, useMutation } from '@apollo/client';
import { useContext } from 'react';
import { CardContext } from '../App';
import { LINK_FIELDS, VOTE_FIELDS, FULL_POST_FIELDS } from '../fragments';

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

export default function useGetPrev(cardId: string, postId: string) {
  const { dispatch } = useContext(CardContext);
  const [getPrevLinks] = useMutation(GET_PREV, {
    onError: error => {
      console.error(error);
    },
    onCompleted: data => {
      console.log(data);
      dispatch({
        type: 'ADD_PREV',
        cardId,
        inLinks: data.getPrev,
      })
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