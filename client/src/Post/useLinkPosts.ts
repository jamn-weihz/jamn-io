import { gql, useMutation, useReactiveVar } from '@apollo/client';
import { useContext } from 'react';
import { ItemContext } from '../App';
import { snackbarVar, linkVar, sessionVar } from '../cache';
import { LINK_FIELDS, VOTE_FIELDS } from '../fragments';

const LINK_POSTS = gql`
  mutation LinkPosts($sessionId: String!, $sourcePostId: String!, $targetPostId: String!) {
    linkPosts(sessionId: $sessionId, sourcePostId: $sourcePostId, targetPostId: $targetPostId) {
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
`
export default function useLinkPosts() {
  const linkDetail = useReactiveVar(linkVar);
  const sessionDetail = useReactiveVar(sessionVar);
  const { dispatch } = useContext(ItemContext);

  const [link] = useMutation(LINK_POSTS, {
    onError: error => {
      console.error(error);
      if (error.message === 'Unauthorized') {
        snackbarVar({
          isUnauthorized: true,
          isSessionExpired: false,
        })
      }
    },
    onCompleted: data => {
      console.log(data);
      linkVar({
        sourcePostId: '',
        targetPostId: '',
      });
      if (data.linkPosts.deleteDate) {
        dispatch({
          type: 'REMOVE_LINK',
          link: data.linkPosts,
        });
      }
      else {
        dispatch({
          type:'ADD_LINK',
          link: data.linkPosts,
        });
      }
    }
  });

  const linkPosts = () => {
    link({
      variables: {
        sessionId: sessionDetail.id,
        sourcePostId: linkDetail.sourcePostId,
        targetPostId: linkDetail.targetPostId,
      },
    });
  };

  return { linkPosts }
}