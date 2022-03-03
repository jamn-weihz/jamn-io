import { AddNextAction, Card, CardState } from '../types/Card';
import { v4 as uuidv4 } from 'uuid';

export default function reduceAddNext(state: CardState, action: AddNextAction) {
  const idToCard = {} as any;
  action.outLinks.forEach(link => {
    let existingCard = null as Card | null;
    state[action.cardId].nextIds.some(id => {
      if (state[id].linkId === link.id) {
        existingCard = state[id];
        return true;
      }
      return false;
    });
    if (!existingCard) {
      const id = uuidv4();
      idToCard[id] = {
        id,
        parentId: action.cardId,
        linkId: link.id,
        postId: link.targetPostId,
        showPrev: false,
        showNext: false,
        prevIds: [],
        nextIds: [],
        refresh: false,
      };
    }
  });
  return {
    ...state,
    ...idToCard,
    [action.cardId]: {
      ...state[action.cardId],
      nextIds: [
        ...state[action.cardId].nextIds,
        ...Object.keys(idToCard),
      ]
    },
  };
}
