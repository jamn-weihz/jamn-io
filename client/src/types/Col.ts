
export type Col = {
  id: string;
  i: number;
  pathname: string;
  createDate?: Date;
  updateDate?: Date;
  deleteDate?: Date | null;
  __typename: string;
}

export type ColSlice = {
  pathname: string;
  id: string;
}

export type ColUnit = {
  col: Col;
  stack: ColSlice[];
  index: number;
  showOptions: boolean;
}

export type ColState = {
  colUnits: ColUnit[];
  i: number;
  isInit: boolean;
  showAdder: boolean;
  scroll: boolean;
  navigate: boolean;
  addedCol: Col | null;
}

export type ResetColsAction = {
  type: 'RESET_COLS';
}

export type InitColsAction = {
  type: 'INIT_COLS';
  cols: Col[];
}

export type AddColAction = {
  type: 'ADD_COL';
  col: Col;
  id: string;
  navigate: boolean;
}

export type RemoveColAction = {
  type: 'REMOVE_COL';
  col: Col;
}

export type UpdateColAction = {
  type: 'UPDATE_COL';
  colUnit: ColUnit;
  navigate: boolean;
}

export type ShiftColsAction = {
  type: 'SHIFT_COLS';
  cols: Col[];
  i: number;
  scroll: boolean;
}

export type SelectColAction = {
  type: 'SELECT_COL';
  i: number;
  scroll: boolean;
  navigate: boolean;
}

export type ShowColAdderAction = {
  type: 'SHOW_ADDER';
}

export type HideColAdderAction = {
  type: 'HIDE_ADDER';
}

export type ToggleColOptions = {
  type: 'TOGGLE_COL_OPTIONS';
  col: Col;
}

export type ScrollColsAction = {
  type: 'SCROLL_COMPLETE';
}

export type NavigateColAction = {
  type: 'NAVIGATE_COMPLETE';
}

export type ClearAddedColAction = {
  type: 'CLEAR_ADDED_COL_COMPLETE';
}



export type ColAction = 
  ResetColsAction |
  InitColsAction |
  AddColAction |
  RemoveColAction |
  UpdateColAction |
  ShiftColsAction |
  SelectColAction |
  ShowColAdderAction |
  HideColAdderAction |
  ToggleColOptions |
  ScrollColsAction |
  NavigateColAction |
  ClearAddedColAction;