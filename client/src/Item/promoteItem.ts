import { Item, ItemState } from '../types/Item';
import { v4 as uuidv4 } from 'uuid';

type UpdateUnit = {
  oldItem: Item;
  newItem: Item;
}
export default function promoteItem(state: ItemState, item: Item) {
  const idToItem = {} as ItemState;
  const rootItem = {
    ...item,
    id: uuidv4(),
    parentId: '',
    linkId: '',
    prevIds: [],
    nextIds: [],
  } as Item;
  idToItem[rootItem.id] = rootItem;
  const units = [{
    oldItem: item,
    newItem: rootItem,
  }] as UpdateUnit[];

  while (units.length) {
    const unit = units.shift() as UpdateUnit;
    
    unit.oldItem.prevIds.forEach(itemId => {
      const prev = state[itemId];
      const newItem = {
        ...prev,
        id: uuidv4(),
        prevIds: [],
        nextIds: [],
      } as Item;
      idToItem[newItem.id] = newItem;
      unit.newItem.prevIds.push(newItem.id);
      units.push({
        oldItem: prev,
        newItem,
      })
    });

    unit.oldItem.nextIds.forEach(itemId => {
      const next = state[itemId];
      const newItem = {
        ...next,
        id: uuidv4(),
        prevIds: [],
        nextIds: [],
      } as Item;
      idToItem[newItem.id] = newItem;
      unit.newItem.nextIds.push(newItem.id);
      units.push({
        oldItem: next,
        newItem,
      });
    });
  }

  return {idToItem, rootItem};
}