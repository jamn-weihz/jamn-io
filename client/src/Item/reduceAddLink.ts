import { Item, ItemState } from '../types/Item';
import { v4 as uuidv4 } from 'uuid';

export default function reduceAddLink(state: ItemState, action: any) {
  const idToItem = {} as ItemState;
  Object.keys(state).forEach(itemId => {
    const item = state[itemId];
    if (
      item.postId === action.link.sourcePostId && 
      item.showNext && 
      !(item.isRootRecentUserVoteItem && item.userId === action.link.targetPost.userId)
    ) {
      if (!item.nextIds.some(id => state[id].postId === action.link.targetPostId)) {
        const newItem = {
          id: uuidv4(),
          userId: action.link.targetPost.userId,
          parentId: itemId,
          linkId: action.link.id,
          postId: action.link.targetPostId,
          showPrev: false,
          showNext: false,
          prevIds: [],
          nextIds: [],
          isNewlySaved: false,
          refreshPost: false,
          getLinks: false,
          isRootRecentUserVoteItem: false,
        } as Item;
        idToItem[newItem.id] = newItem;
        idToItem[item.id] = {
          ...item,
          nextIds: [...item.nextIds, newItem.id],
        };
      }
    }
    else if (
      item.postId === action.link.targetPostId && 
      item.showPrev && !item.isRootRecentUserVoteItem &&
      !(item.isRootRecentUserVoteItem && item.userId === action.link.sourcePost.userId)
    ) {
      if (!item.prevIds.some(id => state[id].postId === action.link.sourcePostId)) {
        const newItem = {
          id: uuidv4(),
          userId: action.link.sourcePost.userId,
          parentId: itemId,
          linkId: action.link.id,
          postId: action.link.sourcePostId,
          showPrev: false,
          showNext: false,
          prevIds: [],
          nextIds: [],
          isNewlySaved: false,
          refreshPost: false,
          getLinks: false,
          isRootRecentUserVoteItem: false,
        } as Item;
        idToItem[newItem.id] = newItem;
        idToItem[item.id] = {
          ...item,
          prevIds: [...item.prevIds, newItem.id],
        };
      }
    }
  });
  return {
    ...state,
    ...idToItem,
  }
}