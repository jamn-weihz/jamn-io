import { gql, useApolloClient, useMutation, useReactiveVar } from '@apollo/client';
import { useContext } from 'react';
import { ItemContext, PostContext } from '../App';
import { snackbarVar, sessionVar } from '../cache';
import { ItemState } from '../types/Item';

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

export default function useSavePost(postId: string, itemId: string) {
  const client = useApolloClient();

  const { state: postState } = useContext(PostContext);
  const { state, dispatch } = useContext(ItemContext);
  
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
      const idToItem: ItemState = {};

      postState[postId].forEach(id => {
        if (id === itemId) {
          idToItem[id] = {
            ...state[id],
            isNewlySaved: true,
          }
        }
        else {
          idToItem[id] = {
            ...state[id],
            refreshPost: true,
          };
        }
      });

      dispatch({
        type: 'MERGE_ITEMS',
        idToItem,
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