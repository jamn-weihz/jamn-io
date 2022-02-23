import { gql, useMutation } from '@apollo/client';
import { replyVar } from '../cache';
import { FULL_POST_FIELDS, LINK_FIELDS, VOTE_FIELDS } from '../fragments';
import { Jam } from '../types/Jam';
import { Link } from '../types/Link';
import { Post } from '../types/Post';
import { User } from '../types/User';

const REPLY_POST = gql`
  mutation ReplyPost($sourcePostId: String!, $jamId: String) {
    replyPost(sourcePostId: $sourcePostId, jamId: $jamId) {
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

type HandleCompleted = (link: Link) => void;

export default function useReplyPost(sourcePostId: string, jam: Jam | undefined, handleCompleted: HandleCompleted) {
  const [reply] = useMutation(REPLY_POST, {
    onError: error => {
      console.error(error);
    },
    onCompleted: data => {
      console.log(data);
      handleCompleted(data.replyPost);
      replyVar({
        postId: data.replyPost.targetPost.id,
      })
    }
  });

  const replyPost = () => {
    const jamId = jam?.id;
    reply({
      variables: {
        sourcePostId,
        jamId,
      }
    })
  };

  return { replyPost }
}