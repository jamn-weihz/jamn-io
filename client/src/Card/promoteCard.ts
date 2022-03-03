import { Card, CardState } from '../types/Card';
import { v4 as uuidv4 } from 'uuid';

type UpdateUnit = {
  oldCard: Card;
  newCard: Card;
}
export default function promoteCard(state: CardState, card: Card) {
  const idToCard = {} as CardState;
  const rootCard = {
    ...card,
    id: uuidv4(),
    parentId: '',
    linkId: '',
    prevIds: [],
    nextIds: [],
  } as Card;
  idToCard[rootCard.id] = rootCard;
  const units = [{
    oldCard: card,
    newCard: rootCard,
  }] as UpdateUnit[];

  while (units.length) {
    const unit = units.shift() as UpdateUnit;
    
    unit.oldCard.prevIds.forEach(cardId => {
      const prev = state[cardId];
      const newCard = {
        ...prev,
        id: uuidv4(),
        prevIds: [],
        nextIds: [],
      } as Card;
      idToCard[newCard.id] = newCard;
      unit.newCard.prevIds.push(newCard.id);
      units.push({
        oldCard: prev,
        newCard,
      })
    });

    unit.oldCard.nextIds.forEach(cardId => {
      const next = state[cardId];
      const newCard = {
        ...next,
        id: uuidv4(),
        prevIds: [],
        nextIds: [],
      } as Card;
      idToCard[newCard.id] = newCard;
      unit.newCard.nextIds.push(newCard.id);
      units.push({
        oldCard: next,
        newCard,
      });
    });
  }

  return {idToCard, rootCard};
}