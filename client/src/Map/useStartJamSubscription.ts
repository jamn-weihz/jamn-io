import { gql, useSubscription } from '@apollo/client';
import { Dispatch, SetStateAction } from 'react';
import { Jam } from '../types/Jam';

const START_JAM = gql`
  subscription StartJam {
    startJam {
      id
      name
      lng
      lat
    }
  }
`
export default function useStartJamSubscription(jams: Jam[], setJams: Dispatch<SetStateAction<Jam[]>>) {
  useSubscription(START_JAM, {
    variables: {},
    onSubscriptionData: ({subscriptionData: { data: { startJam }}}) => {
      console.log(startJam)
      setJams([...jams, startJam]);
    },
  })
}