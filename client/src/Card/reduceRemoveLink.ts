import { CardState } from '../types/Card';

export default function reduceRemoveLink(state: CardState, action: any) {
  const deletionIds = [] as string[];
  const idToCard = {} as CardState;
  Object.keys(state).forEach(cardId => {
    const card = state[cardId];
    if (card.parentId && card.linkId === action.link.id) {
      const parent = state[card.parentId];
      idToCard[parent.id] = {
        ...parent,
        prevIds: parent.prevIds.filter(id => id !== cardId),
        nextIds: parent.nextIds.filter(id => id !== cardId),
      };
      deletionIds.push(cardId);
    } 
  });
  const state1 = {
    ...state,
    ...idToCard,
  };
  deletionIds.forEach(id => {
    delete state1[id];
  });
  return state1;
}