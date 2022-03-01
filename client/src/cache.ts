import { makeVar } from '@apollo/client';
import { ColState } from './types/Col';
import { User } from './types/User';
import { PaletteMode } from '@mui/material';
import { v4 as uuidv4 } from 'uuid';
import { Jam } from './types/Jam';

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

export const startJamVar = makeVar({
  jam: null as Jam | null,
});

export const snackbarVar = makeVar({
  isUnauthorized: false,
  isSessionExpired: false,
})

export const addColVar = makeVar({
  id: '',
})