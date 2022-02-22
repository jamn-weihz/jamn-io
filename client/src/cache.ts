import { makeVar } from '@apollo/client';
import { Col } from './types/Col';
import { SurveyorDetailType } from './types/Surveyor';
import { User } from './types/User';
import { v4 as uuidv4 } from 'uuid';

export const tokenVar = makeVar({
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
  cols: [
    { 
      id: uuidv4(),
      pathname: '/register',
      i: 0,
      __typename: 'Col',
    },
    { 
      id: uuidv4(),
      pathname: '/map',
      i: 1,
      __typename: 'Col',
    },
    {
      id: uuidv4(),
      pathname: '/search',
      i: 2,
      __typename: 'Col',
   }
  ] as Col[],
});