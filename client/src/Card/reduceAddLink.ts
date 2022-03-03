import { Card, CardState } from '../types/Card';
import { v4 as uuidv4 } from 'uuid';

export default function reduceAddLink(state: CardState, action: any) {
  const idToCard = {} as CardState;
  Object.keys(state).forEach(cardId => {
    const card = state[cardId];
    if (
      card.postId === action.link.sourcePostId && 
      card.showNext && 
      !(card.isRootRecentUserVoteCard && card.userId === action.link.targetPost.userId)
    ) {
      if (!card.nextIds.some(id => state[id].postId === action.link.targetPostId)) {
        const newCard = {
          id: uuidv4(),
          userId: action.link.targetPost.userId,
          parentId: cardId,
          linkId: action.link.id,
          postId: action.link.targetPostId,
          showPrev: false,
          showNext: false,
          prevIds: [],
          nextIds: [],
          isNewlySaved: false,
          refreshPost: false,
          getLinks: false,
          isRootRecentUserVoteCard: false,
        } as Card;
        idToCard[newCard.id] = newCard;
        idToCard[card.id] = {
          ...card,
          nextIds: [...card.nextIds, newCard.id],
        };
      }
    }
    else if (
      card.postId === action.link.targetPostId && 
      card.showPrev && !card.isRootRecentUserVoteCard &&
      !(card.isRootRecentUserVoteCard && card.userId === action.link.sourcePost.userId)
    ) {
      if (!card.prevIds.some(id => state[id].postId === action.link.sourcePostId)) {
        const newCard = {
          id: uuidv4(),
          userId: action.link.sourcePost.userId,
          parentId: cardId,
          linkId: action.link.id,
          postId: action.link.sourcePostId,
          showPrev: false,
          showNext: false,
          prevIds: [],
          nextIds: [],
          isNewlySaved: false,
          refreshPost: false,
          getLinks: false,
          isRootRecentUserVoteCard: false,
        } as Card;
        idToCard[newCard.id] = newCard;
        idToCard[card.id] = {
          ...card,
          prevIds: [...card.prevIds, newCard.id],
        };
      }
    }
  });
  return {
    ...state,
    ...idToCard,
  }
}