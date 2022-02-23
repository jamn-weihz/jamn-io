import { makeVar } from '@apollo/client';
import { Col } from './types/Col';
import { SurveyorDetailType } from './types/Surveyor';
import { User } from './types/User';

export const tokenVar = makeVar({
  isInit: false,
  isValid: false,
  interval: null as ReturnType<typeof setInterval> | null,
});

export const userVar = makeVar(null as User | null);

export const pathVar = makeVar({
  pathToBranch: {} as any,
});

export const surveyorVar = makeVar({} as SurveyorDetailType)

export const sizeVar = makeVar({
  width: window.innerWidth,
  height: window.innerHeight,
});

export const colVar = makeVar({
  isAdding: false,
  cols: [] as Col[],
  i: 0,
});

export const replyVar = makeVar({
  postId: '',
});

export const linkVar = makeVar({
  sourcePostId: '',
  targetPostId: '',
})