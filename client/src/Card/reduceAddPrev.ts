
import { AddPrevAction, Card, CardState } from '../types/Card';
import { v4 as uuidv4 } from 'uuid';

export default function reduceAddPrev(state: CardState, action: AddPrevAction): CardState {
  const idToCard = {} as any;
  action.inLinks.forEach(link => {
    let existingCard = null as Card | null;
    state[action.cardId].prevIds.some(id => {
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
        postId: link.sourcePostId,
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
      prevIds: [
        ...state[action.cardId].prevIds,
        ...Object.keys(idToCard),
      ]
    },
  };
}