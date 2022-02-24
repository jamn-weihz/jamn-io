import { gql, useMutation, useReactiveVar } from "@apollo/client";
import { Post } from "../types/Post";
import { ContentState, convertToRaw } from 'draft-js';
import { sessionVar } from "../cache";

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

export default function useSavePost(postId: string) {
  const sessionDetail = useReactiveVar(sessionVar);
  const [save] = useMutation(SAVE_POST, {
    onError: error => {
      console.error(error);
    },
    onCompleted: data => {
      console.log(data);
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