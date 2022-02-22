import { makeVar } from '@apollo/client';
import { SurveyorDetailType } from './types/Surveyor';
import { User } from './types/User';

export const tokenVar = makeVar({
  isValid: false,
  interval: null as ReturnType<typeof setInterval> | null,
});

export const userVar = makeVar({
  user: null as User | null,
});

export const pathVar = makeVar({
  pathToBranch: {} as any,
});

export const surveyorVar = makeVar({} as SurveyorDetailType)

export const sizeVar = makeVar({
  width: window.innerWidth,
  height: window.innerHeight,
})