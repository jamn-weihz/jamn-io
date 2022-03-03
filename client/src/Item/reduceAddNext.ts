import { AddNextAction, Item, ItemState } from '../types/Item';
import { v4 as uuidv4 } from 'uuid';

export default function reduceAddNext(state: ItemState, action: AddNextAction) {
  const idToItem = {} as any;
  action.outLinks.forEach(link => {
    let existingItem = null as Item | null;
    state[action.itemId].nextIds.some(id => {
      if (state[id].linkId === link.id) {
        existingItem = state[id];
        return true;
      }
      return false;
    });
    if (!existingItem) {
      const id = uuidv4();
      idToItem[id] = {
        id,
        parentId: action.itemId,
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
    ...idToItem,
    [action.itemId]: {
      ...state[action.itemId],
      nextIds: [
        ...state[action.itemId].nextIds,
        ...Object.keys(idToItem),
      ]
    },
  };
}
