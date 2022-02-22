import { gql, useMutation } from '@apollo/client';
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

export default function useReplyPost(sourcePostId: string, context: User | Jam, handleCompleted: HandleCompleted) {
  const [reply] = useMutation(REPLY_POST, {
    onError: error => {
      console.error(error);
    },
    onCompleted: data => {
      console.log(data);
      handleCompleted(data.replyPost);
    }
  });

  const replyPost = () => {
    const jamId = context.__typename === 'Jam'
      ? context.id
      : null;
    reply({
      variables: {
        sourcePostId,
        jamId,
      }
    })
  };

  return { replyPost }
}