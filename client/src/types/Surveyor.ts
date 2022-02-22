import { Link } from './Link'
import { Post } from './Post'

export type SurveyorItem = {
  link?: Link;
  post: Post;
  instanceId: string;
  showPrev: boolean;
  showNext: boolean;
  prev: SurveyorItem[];
  next: SurveyorItem[];
  refresh: boolean;
}

export type SurveyorSlice = {
  originalQuery: string;
  query: string;
  items: SurveyorItem[];
}

export type SurveyorState = {
  index: number;
  stack: SurveyorSlice[];
  scrollToTop: boolean;
  reload: boolean;
  triggerRefinement: boolean;
}

export type SurveyorDetailType = {
  [id: string]: SurveyorState;
}