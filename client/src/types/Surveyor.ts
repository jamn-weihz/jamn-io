import { ReactiveVar } from '@apollo/client'

export type SurveyorSlice = {
  originalQuery: string;
  query: string;
  itemIds: string[];
}

export type SurveyorState = {
  index: number;
  stack: SurveyorSlice[];
  scrollToTop: boolean;
  reload: boolean;
  triggerRefinement: boolean;
}

export type SurveyorVarItem = {
  colId: string;
  var: ReactiveVar<SurveyorState>;
}

export type ChildrenState = {
  [itemId: string]: string[],
}

export type ChildrenAction = {
  type: string;
}