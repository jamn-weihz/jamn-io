import { gql, useMutation, useReactiveVar } from '@apollo/client';
import { linkVar } from '../cache';
import { LINK_FIELDS, POST_FIELDS, VOTE_FIELDS } from '../fragments';

const LINK_POSTS = gql`
  mutation LinkPosts($sourcePostId: String!, $targetPostId: String!) {
    linkPosts(sourcePostId: $sourcePostId, targetPostId: $targetPostId) {
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

  const [link] = useMutation(LINK_POSTS, {
    onError: error => {
      console.error(error);
    },
    onCompleted: data => {
      console.log(data);
      linkVar({
        sourcePostId: '',
        targetPostId: '',
      })
    }
  });

  const linkPosts = () => {
    link({
      variables: {
        sourcePostId: linkDetail.sourcePostId,
        targetPostId: linkDetail.targetPostId,
      },
    });
  };

  return { linkPosts }
}