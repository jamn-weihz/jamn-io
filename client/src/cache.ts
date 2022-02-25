import { makeVar } from '@apollo/client';
import { Col } from './types/Col';
import { User } from './types/User';
import { PaletteMode } from '@mui/material';
import { ItemAction, ItemState } from './types/Item';
import { Dispatch } from 'react';
import { v4 as uuidv4 } from 'uuid';

export const tokenVar = makeVar({
  isInit: false,
  isValid: false,
  interval: null as ReturnType<typeof setInterval> | null,
});

export const userVar = makeVar(null as User | null);

export const pathVar = makeVar({
  pathToBranch: {} as any,
});

export const sizeVar = makeVar({
  width: window.innerWidth,
  height: window.innerHeight,
});

export const colVar = makeVar({
  isAdding: false,
  cols: [] as Col[],
  i: 0,
  scroll: false,
});

export const focusVar = makeVar({
  postId: '',
});

export const linkVar = makeVar({
  sourcePostId: '',
  targetPostId: '',
})

export const paletteVar = makeVar({
  mode: (
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  ) ? 'dark' : 'light' as PaletteMode,
})

export const sessionVar = makeVar({
  id: uuidv4(),
});