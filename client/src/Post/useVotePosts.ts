import { gql, useMutation, useReactiveVar } from '@apollo/client';
import { useContext } from 'react';
import { ItemContext } from '../App';
import { sessionVar } from '../cache';
import { LINK_FIELDS, VOTE_FIELDS } from '../fragments';

const VOTE_POSTS = gql`
  mutation VotePosts($sessionId: String!, $linkId: String!, $clicks: Int!) {
    votePosts(sessionId: $sessionId, linkId: $linkId, clicks: $clicks) {
      ...LinkFields
      sourcePost {
        id
        nextCount
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
  ${VOTE_FIELDS}
`;


export default function useVotePosts() {
  const { dispatch } = useContext(ItemContext);
  const sessionDetail = useReactiveVar(sessionVar);
  const [vote] = useMutation(VOTE_POSTS, {
    onError: error => {
      console.error(error);
    },
    onCompleted: data => {
      console.log(data);
      if (data.votePosts.deleteDate) {
        dispatch({
          type: 'REMOVE_LINK',
          link: data.votePosts,
        })
      }
    }
  });

  const votePosts = (linkId: string, clicks: number) => {
    vote({
      variables: {
        sessionId: sessionDetail.id,
        linkId,
        clicks,
      },
    });
  };

  return { votePosts };
}