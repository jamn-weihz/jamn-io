import { Box, Link as MUILink } from '@mui/material';
import CardComponent from './CardComponent';
import React, { Dispatch, SetStateAction, useContext } from 'react';

import { useApolloClient } from '@apollo/client';

import { SurveyorState } from '../types/Surveyor';
import { FULL_POST_FIELDS } from '../fragments';
import { Post } from '../types/Post';
import { Col, ColUnit } from '../types/Col';
import useGetPrev from '../Post/useGetPrev';
import useGetNext from '../Post/useGetNext';
import { LOAD_LIMIT } from '../constants';
import { CardContext } from '../App';
import { Jam } from '../types/Jam';

interface CardTreeProps {
  post?: Post;
  jam?: Jam;
  colUnit: ColUnit;
  cardId: string;
  depth: number;
  surveyorState: SurveyorState;
  setSurveyorState: Dispatch<SetStateAction<SurveyorState>>;
  hideOpaquePosts: boolean;
}
export default function CardTree(props: CardTreeProps) {
  const client = useApolloClient();

  const {state, dispatch} = useContext(CardContext);
  const card = state[props.cardId];

  const { getPrev } = useGetPrev(props.cardId, card?.postId);
  const { getNext } = useGetNext(props.cardId, card?.postId);

  if (!card) return null;

  const handleLoadClick = (event: React.MouseEvent) => {
    if (card.showPrev) {
      getPrev(card.prevIds.length);
    }
    else if (card.showNext) {
      getNext(card.nextIds.length);
    }
  }

  const post = client.cache.readFragment({
    id: client.cache.identify({
      id: card.postId,
      __typename: 'Post',
    }),
    fragment: FULL_POST_FIELDS,
    fragmentName: 'FullPostFields',
  }) as Post;

  let remaining = 0;
  let cardIds = [] as string[];
  if (card.showPrev) {
    cardIds = card.prevIds;
    remaining = cardIds.length > 0
      ? Math.min(LOAD_LIMIT, post.prevCount - cardIds.length)
      : 0;
  }
  else if (card.showNext) {
    cardIds = card.nextIds;
    remaining = cardIds.length > 0 
      ? Math.min(LOAD_LIMIT, post.nextCount - cardIds.length)
      : 0;
  }

  if (!post?.id) return null;

  if (props.hideOpaquePosts && post.isOpaque) return null;

  return (
    <Box>
      <Box sx={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
      }}>
        <CardComponent
          colUnit={props.colUnit}
          card={card}
          depth={props.depth}
          surveyorState={props.surveyorState}
          setSurveyorState={props.setSurveyorState}
          jam={props.jam}
          post={props.post}
        />
      </Box>
      <Box sx={{
        borderLeft: `1px solid ${post.user.color}`,
        marginLeft: '8px',
      }}>
        {
          cardIds.map(cardId => {
            return (
              <CardTree
                key={`surveyor-tree-${cardId}`}
                cardId={cardId}
                depth={props.depth + 1}
                colUnit={props.colUnit}
                surveyorState={props.surveyorState}
                setSurveyorState={props.setSurveyorState}
                jam={props.jam}
                post={props.post}
                hideOpaquePosts={props.hideOpaquePosts}
              />
            )
          })
        }
        {
          remaining > 0
            ? <Box onClick={handleLoadClick} sx={{
                fontSize: 12,
                marginTop: '5px',
                marginLeft: '10px',
                textAlign: 'left',
                cursor: 'pointer',
              }}>
                <MUILink sx={{
                  color: post.user.color,
                }}>
                  load {remaining} more
                </MUILink>
              </Box>
            : null
        }
      </Box>
    </Box>
  );
}