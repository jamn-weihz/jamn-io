export type SurveyorSlice = {
  originalQuery: string;
  query: string;
  itemIds: string[];
}

export type SurveyorState = {
  index: number;
  stack: SurveyorSlice[];
  scrollToTop: boolean;
  scrollToBottom: boolean;
  reload: boolean;
  triggerRefinement: boolean;
}

export type ChildrenState = {
  [itemId: string]: string[],
}

export type ChildrenAction = {
  type: string;
}