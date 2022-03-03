import { Link } from "./Link"

export type Card = {
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
  isRootRecentUserVoteCard: boolean;
}

export type CardState = {
  [id: string]: Card
}

export type AddPrevAction = {
  type: 'ADD_PREV';
  cardId: string;
  inLinks: Link[];
}

export type AddNextAction = {
  type: 'ADD_NEXT';
  cardId: string;
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
export type MergeCardsAction = {
  type: 'MERGE_ITEMS';
  idToCard: CardState;
}

export type UpdateCardAction = {
  type: 'UPDATE_ITEM';
  card: Card;
}

export type CardAction = 
  MergeCardsAction |
  UpdateCardAction |
  AddPrevAction |
  AddNextAction |
  AddLinkAction |
  RemoveLinkAction;