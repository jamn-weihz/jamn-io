import { gql, useApolloClient, useMutation, useReactiveVar } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { colVar, userVar } from '../cache';
import { FULL_USER_FIELDS } from '../fragments';
import { Col, ColState } from '../types/Col';
import { User } from '../types/User';
import { v4 as uuidv4 } from 'uuid';
import { useState } from 'react';
const SAVE_COL = gql`
  mutation SaveCol($colId: String!, $pathname: String!) {
    saveCol(colId: $colId, pathname: $pathname) {
      id
      pathname
    }
  }
`;

export default function useChangeCol(di?: number) {
  const navigate = useNavigate();

  const client = useApolloClient();

  const userDetail = useReactiveVar(userVar);
  const colDetail = useReactiveVar(colVar);

  const [colSliceId, setColSliceId] = useState('');

  const [save] = useMutation(SAVE_COL, {
    onError: error => {
      console.error(error);
    },
    onCompleted: data => {
      console.log(data);
      colVar({
        ...colDetail, 
        colStates: colDetail.colStates.map(colState_i => {
          if (colState_i.col.id === data.saveCol.id) {
            let stack = colState_i.stack;
            if (di !== -1 && di !== 1) {
              stack = colState_i.stack.slice(0, colState_i.index + 1);
              stack.push({ 
                pathname: data.saveCol.pathname,
                id: colSliceId,
              });
            }
            return {
              ...colState_i,
              col: {
                ...colState_i.col,
                ...data.saveCol
              },
              stack,
              index: colState_i.index + (di || 1),
            } as ColState;
          }
          return colState_i;
        }),
      })
    },
  });

  const changeCol = (col: Col, pathname: string) => {
    if (col.pathname === pathname) return;
    
    const id = uuidv4();
    setColSliceId(id);
    navigate(pathname, {
      state: {
        id,
      }
    });

    if (userDetail?.id) {
      save({
        variables: {
          colId: col.id,
          pathname,
        }
      });
      client.cache.modify({
        id: client.cache.identify(col),
        fields: {
          pathname: () => pathname,
        },
      });
      const user = client.cache.readFragment({
        id: client.cache.identify(userDetail),
        fragment: FULL_USER_FIELDS,
        fragmentName: 'FullUserFields',
      }) as User;
      userVar(user);

      const colStates = colDetail.colStates.map(colState => {
        if (colState.col.id === col.id) {
          return {
            ...colState,
            col: {
              ...colState.col,
              pathname,
            },
          };
        }
        return colState;
      })
      colVar({
        ...colDetail,
        colStates,
        i: col.i,
      })
    }
    else {
      colVar({
        ...colDetail,
        colStates: colDetail.colStates.map(colState_i => {
          if (colState_i.col.id === col.id) {
            let stack = colState_i.stack;
            if (di !== -1 && di !== 1) {
              stack = colState_i.stack.slice(0, colState_i.index + 1)
              stack.push({ 
                pathname,
                id,
              });
            }

            return {
              ...colState_i,
              col: {
                ...col,
                pathname,
              },
              stack,
              index: colState_i.index + (di || 1),
            } as ColState;
          }
          return colState_i;
        }),
        i: col.i
      });
    }
  }
  return { changeCol };
}