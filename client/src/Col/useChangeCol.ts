import { gql, useApolloClient, useMutation, useReactiveVar } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { colVar, userVar } from '../cache';
import { COL_FIELDS, FULL_USER_FIELDS } from '../fragments';
import { Col } from '../types/Col';
import { User } from '../types/User';

const SAVE_COL = gql`
  mutation SaveCol($colId: String!, $pathname: String!) {
    saveCol(colId: $colId, pathname: $pathname) {
      ...ColFields
    }
  }
  ${COL_FIELDS}
`;

export default function useChangeCol() {
  const navigate = useNavigate();

  const client = useApolloClient();

  const userDetail = useReactiveVar(userVar);
  const colDetail = useReactiveVar(colVar);

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
            const stack = colState_i.stack.slice(0, colState_i.index + 1);
            stack.push({ 
              pathname: data.saveCol.pathname,
            });
            return {
              col: data.saveCol,
              stack,
              index: colState_i.index + 1
            }
          }
          return colState_i;
        }),
      })
    },
  });

  const changeCol = (col: Col, pathname: string) => {
    navigate(pathname);
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
      colVar({
        ...colDetail,
        i: col.i,
      })
    }
    else {
      colVar({
        ...colDetail,
        colStates: colDetail.colStates.map(colState_i => {
          if (colState_i.col.id === col.id) {
            const stack = colState_i.stack.slice(0, colState_i.index + 1)
            stack.push({ pathname });
            return {
              col: {
                ...col,
                pathname,
              },
              stack,
              index: colState_i.index + 1,
            }
          }
          return colState_i;
        }),
        i: col.i
      });
    }
  }
  return { changeCol };
}