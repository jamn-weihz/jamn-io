
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
}

export type ColState = {
  col: Col;
  stack: ColSlice[];
  index: number;
  showOptions: boolean;
}