import { gql, useMutation, useReactiveVar } from '@apollo/client';
import { focusVar, sessionVar } from '../cache';
import { FULL_POST_FIELDS, LINK_FIELDS, VOTE_FIELDS } from '../fragments';
import { v4 as uuidv4 } from 'uuid';
import { useContext } from 'react';
import { ItemContext } from '../App';

const REPLY_POST = gql`
  mutation ReplyPost($sessionId: String!, $sourcePostId: String!, $jamId: String) {
    replyPost(sessionId: $sessionId, sourcePostId: $sourcePostId, jamId: $jamId) {
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

export default function useReplyPost(itemId: string, sourcePostId: string, jamId?: string) {
  const { state, dispatch } = useContext(ItemContext);
  const sessionDetail = useReactiveVar(sessionVar);
  const [reply] = useMutation(REPLY_POST, {
    onError: error => {
      console.error(error);
    },
    onCompleted: data => {
      console.log(data);
      focusVar({
        postId: data.replyPost.targetPost.id,
      });
      const newItem = {
        id: uuidv4(),
        parentId: itemId,
        linkId: data.replyPost.id,
        postId: data.replyPost.targetPost.id,
        showPrev: false,
        showNext: true,
        prevIds: [],
        nextIds: [],
        refresh: false,
      };
      dispatch({
        type: 'ADD_ITEMS',
        idToItem: {
          [newItem.id]: newItem,
        },
      })
      dispatch({
        type: 'UPDATE_ITEM',
        item: {
          ...state[itemId],
          showPrev: false,
          showNext: true,
          nextIds: [newItem.id, ...state[itemId].nextIds],
        }
      })
    },
  });

  const replyPost = () => {
    reply({
      variables: {
        sessionId: sessionDetail.id,
        sourcePostId,
        jamId,
      }
    })
  };

  return { replyPost }
}