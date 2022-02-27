import { 
  gql,
  useApolloClient,
  useReactiveVar,
  useSubscription,
} from '@apollo/client';
import { Dispatch, useContext } from 'react';
import { ItemContext } from '../App';
import { sessionVar } from '../cache';
import { FULL_POST_FIELDS, LINK_FIELDS, VOTE_FIELDS } from '../fragments';
import { ItemAction } from '../types/Item';
import { PostAction } from '../types/Post';

const LINK_POSTS = gql`
  subscription LinkPosts($sessionId: String!, $postIds: [String!]!) {
    linkPosts(sessionId: $sessionId, postIds: $postIds) {
      ...LinkFields
      sourcePost {
        ...FullPostFields
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

export default function useLinkPostsSubcription(postIds: string[], dispatch: Dispatch<ItemAction>) {
  const client = useApolloClient();

  const sessionDetail = useReactiveVar(sessionVar);

  useSubscription(LINK_POSTS, {
    shouldResubscribe: true,
    variables: {
      sessionId: sessionDetail.id,
      postIds,
    },
    onSubscriptionData: ({subscriptionData: {data: {linkPosts}}}) => {
      console.log(linkPosts);

      client.cache.writeQuery({
        query: gql`
          query WriteLink {
            ...LinkFields
            sourcePost {
              ...FullPostFields
            }
            targetPost {
              ...FullPostFields
            }
            votes {
              ...VoteFields
            }
          }
          ${LINK_FIELDS}
          ${FULL_POST_FIELDS}
          ${VOTE_FIELDS}
        `,
        data: linkPosts,
      });

      if (linkPosts.deleteDate) {
        dispatch({
          type: 'REMOVE_LINK',
          link: linkPosts,
        });
      }
      else {
        dispatch({
          type:'ADD_LINK',
          link: linkPosts,
        });
      }
    }
  });
}