import { Item, ItemState } from '../types/Item';
import { v4 as uuidv4 } from 'uuid';

export default function reduceAddLink(state: ItemState, action: any) {
  const idToItem = {} as ItemState;
  Object.keys(state).forEach(itemId => {
    const item = state[itemId];
    if (item.postId === action.link.sourcePostId && item.showNext) {
      if (!item.nextIds.some(id => state[id].postId === action.link.targetPostId)) {
        const newItem = {
          id: uuidv4(),
          parentId: itemId,
          linkId: action.link.id,
          postId: action.link.targetPostId,
          showPrev: false,
          showNext: false,
          prevIds: [],
          nextIds: [],
          refresh: false,
        } as Item;
        idToItem[newItem.id] = newItem;
        idToItem[item.id] = {
          ...item,
          nextIds: [newItem.id, ...item.nextIds],
        };
      }
    }
    else if (item.postId === action.link.targetPostId && item.showPrev) {
      if (!item.prevIds.some(id => state[id].postId === action.link.sourcePostId)) {
        const newItem = {
          id: uuidv4(),
          parentId: itemId,
          linkId: action.link.id,
          postId: action.link.sourcePostId,
          showPrev: false,
          showNext: false,
          prevIds: [],
          nextIds: [],
          refresh: false,
        } as Item;
        idToItem[newItem.id] = newItem;
        idToItem[item.id] = {
          ...item,
          prevIds: [newItem.id, ...item.prevIds],
        };
      }
    }
  });
  return {
    ...state,
    ...idToItem,
  }
}