import { gql, useApolloClient, useMutation, useReactiveVar } from '@apollo/client';
import { colVar, sizeVar, userVar } from '../cache';
import { v4 as uuidv4 } from 'uuid';
import { COL_FIELDS, FULL_USER_FIELDS } from '../fragments';
import { User } from '../types/User';
import React from 'react';
import { getColWidth } from '../utils';
import { useNavigate } from 'react-router-dom';
import { ColState } from '../types/Col';

const ADD_COL = gql`
  mutation AddCol($pathname: String!) {
    addCol(pathname: $pathname) {
      ...ColFields
    }
  }
  ${COL_FIELDS}
`;

export default function useAddCol(containerEl: React.MutableRefObject<HTMLElement | undefined>) {
  const navigate = useNavigate();

  const client = useApolloClient();

  const userDetail = useReactiveVar(userVar);
  const colDetail = useReactiveVar(colVar);
  const sizeDetail = useReactiveVar(sizeVar);

  const [add] = useMutation(ADD_COL, {
    onError: error => {
      console.error(error);
    },
    update: (cache, {data: {addCol}}) => {
      cache.modify({
        id: cache.identify(userDetail || {}),
        fields: {
          cols: (cachedRefs = []) => {
            const newRef = cache.writeFragment({
              id: cache.identify(addCol),
              fragment: COL_FIELDS,
              data: addCol,
            });
            return [...cachedRefs, newRef];
          }
        }
      });
    },
    onCompleted: data => {
      console.log(data);
      const user = client.cache.readFragment({
        id: client.cache.identify(userDetail || {}),
        fragment: FULL_USER_FIELDS,
        fragmentName: 'FullUserFields',
      }) as User;
      userVar(user);
      colVar({
        ...colDetail,
        colStates: [
          ...colDetail.colStates,
          {
            col: data.addCol,
            stack: [{
              pathname: data.addCol.pathname,
              id: uuidv4(),
            }],
            index: 0,
            showOptions: false,
          }
        ],
        i: colDetail.colStates.length,
        isAdding: false,
      });
      containerEl.current?.scrollTo({
        left: colDetail.colStates.length * getColWidth(sizeDetail.width),
        behavior: 'smooth',
      });
      navigate(data.addCol.pathname);
    }
  });

  const addCol = (pathname: string, colStates?: ColState[]) => {
    if (userDetail?.id) {
      add({
        variables: {
          pathname,
        }
      })
    }
    else {
      colVar({
        colStates: [
          ...(colStates || colDetail.colStates),
          { 
            col: {
              i: colStates?.length || colDetail.colStates.length,
              id: uuidv4(),
              pathname,
              __typename: 'Col',
            },
            stack: [{
              pathname,
              id: uuidv4(),
            }],
            index: 0,
            showOptions: false,
          }
        ],
        i: colStates?.length || colDetail.colStates.length,
        isAdding: false,
        scroll: true,
      });
    }
  }

  return { addCol }
}