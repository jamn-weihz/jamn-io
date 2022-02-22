import { gql, useMutation } from "@apollo/client";
import { Post } from "../types/Post";
import { ContentState, convertToRaw } from 'draft-js';

const SAVE_POST = gql`
  mutation SavePost($postId: String!, $draft: String!) {
    savePost(postId: $postId, draft: $draft) {
      id
      draft
      name
      description
      saveDate
    }
  }
`;

export default function useSavePost(postId: string) {
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
        postId,
        draft,
      }
    });
  }

  return { savePost }
}