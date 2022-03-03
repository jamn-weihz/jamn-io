import { Link } from "./Link"

export type Item = {
  id: string;
  userId: string;
  parentId: string;
  linkId: string;
  postId: string;
  showPrev: boolean;
  showNext: boolean;
  prevIds: string[];
  nextIds: string[];
  isNewlySaved: boolean;
  refreshPost: boolean;
  getLinks: boolean;
  isRootRecentUserVoteItem: boolean;
}

export type ItemState = {
  [id: string]: Item
}

export type AddPrevAction = {
  type: 'ADD_PREV';
  itemId: string;
  inLinks: Link[];
}

export type AddNextAction = {
  type: 'ADD_NEXT';
  itemId: string;
  outLinks: Link[];
}
export type AddLinkAction = {
  type: 'ADD_LINK';
  link: Link;
}
export type RemoveLinkAction = {
  type: 'REMOVE_LINK';
  link: Link;
}
export type MergeItemsAction = {
  type: 'MERGE_ITEMS';
  idToItem: ItemState;
}

export type UpdateItemAction = {
  type: 'UPDATE_ITEM';
  item: Item;
}

export type ItemAction = 
  MergeItemsAction |
  UpdateItemAction |
  AddPrevAction |
  AddNextAction |
  AddLinkAction |
  RemoveLinkAction;