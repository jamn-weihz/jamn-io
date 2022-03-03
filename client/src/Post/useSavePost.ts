import { gql, useApolloClient, useMutation, useReactiveVar } from '@apollo/client';
import { useContext } from 'react';
import { CardContext, PostContext } from '../App';
import { snackbarVar, sessionVar } from '../cache';
import { CardState } from '../types/Card';

const SAVE_POST = gql`
  mutation SavePost($sessionId: String!, $postId: String!, $draft: String!) {
    savePost(sessionId: $sessionId, postId: $postId, draft: $draft) {
      id
      draft
      name
      description
      saveDate
    }
  }
`;

export default function useSavePost(postId: string, cardId: string) {
  const client = useApolloClient();

  const { state: postState } = useContext(PostContext);
  const { state, dispatch } = useContext(CardContext);
  
  const sessionDetail = useReactiveVar(sessionVar);
  const [save] = useMutation(SAVE_POST, {
    onError: error => {
      console.error(error);
      if (error.message === 'Unauthorized') {
        snackbarVar({
          isUnauthorized: true,
          isSessionExpired: false,
        });
      }
    },
    onCompleted: data => {
      console.log(data);
      const idToCard: CardState = {};

      postState[postId].forEach(id => {
        if (id === cardId) {
          idToCard[id] = {
            ...state[id],
            isNewlySaved: true,
          }
        }
        else {
          idToCard[id] = {
            ...state[id],
            refreshPost: true,
          };
        }
      });

      dispatch({
        type: 'MERGE_ITEMS',
        idToCard,
      });
    },
  });

  const savePost = (draft: string) => {
    save({
      variables: {
        sessionId: sessionDetail.id,
        postId,
        draft,
      }
    });
  }

  return { savePost }
}