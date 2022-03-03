import { ItemState } from '../types/Item';

export default function reduceRemoveLink(state: ItemState, action: any) {
  const deletionIds = [] as string[];
  const idToItem = {} as ItemState;
  Object.keys(state).forEach(itemId => {
    const item = state[itemId];
    if (item.parentId && item.linkId === action.link.id) {
      const parent = state[item.parentId];
      idToItem[parent.id] = {
        ...parent,
        prevIds: parent.prevIds.filter(id => id !== itemId),
        nextIds: parent.nextIds.filter(id => id !== itemId),
      };
      deletionIds.push(itemId);
    } 
  });
  const state1 = {
    ...state,
    ...idToItem,
  };
  deletionIds.forEach(id => {
    delete state1[id];
  });
  return state1;
}