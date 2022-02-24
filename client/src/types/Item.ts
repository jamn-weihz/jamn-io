import { Link } from "./Link"

export type Item = {
  id: string;
  parentId?: string;
  linkId?: string;
  postId: string;
  showPrev: boolean;
  showNext: boolean;
  prevIds: string[];
  nextIds: string[];
  refresh: boolean;
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
export type AddItemsAction = {
  type: 'ADD_ITEMS';
  idToItem: ItemState;
}

export type UpdateItemAction = {
  type: 'UPDATE_ITEM';
  item: Item;
}

export type ItemAction = 
  AddItemsAction |
  UpdateItemAction |
  AddPrevAction |
  AddNextAction |
  AddLinkAction |
  RemoveLinkAction;