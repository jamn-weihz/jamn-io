
import { AddPrevAction, Item, ItemState } from '../types/Item';
import { v4 as uuidv4 } from 'uuid';

export default function reduceAddPrev(state: ItemState, action: AddPrevAction): ItemState {
  const idToItem = {} as any;
  action.inLinks.forEach(link => {
    let existingItem = null as Item | null;
    state[action.itemId].prevIds.some(id => {
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
    ...idToItem,
    [action.itemId]: {
      ...state[action.itemId],
      prevIds: [
        ...state[action.itemId].prevIds,
        ...Object.keys(idToItem),
      ]
    },
  };
}