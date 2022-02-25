import { gql, useApolloClient, useMutation, useReactiveVar } from '@apollo/client';
import { colVar, sizeVar, userVar } from '../cache';
import { MOBILE_WIDTH } from '../constants';
import { FULL_USER_FIELDS } from '../fragments';
import { Col } from '../types/Col';
import { User } from '../types/User';

const SHIFT_COL = gql`
  mutation ShiftCol($colId: String!, $di: Int!) {
    shiftCol(colId: $colId, di: $di) {
      id
      i
    }
  }
`;

export default function useShiftCol(col: Col, di: number) {
  const client = useApolloClient();

  const userDetail = useReactiveVar(userVar);
  const colDetail = useReactiveVar(colVar);
  const sizeDetail = useReactiveVar(sizeVar);

  const [shift] = useMutation(SHIFT_COL, {
    onError: error => {
      console.error(error);
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
        i: col.i + di,
        scroll: sizeDetail.width < MOBILE_WIDTH
          ? true
          : false,
      });
    }
  })

  const shiftCol = () => {
    if (userDetail?.id) {
      shift({
        variables: {
          colId: col.id,
          di,
        }
      });

      let targetCol;
      userDetail.cols.some(col_i => {
        if (col_i.i === col.i + di) {
          targetCol = col_i
          return true;
        }
        return false;
      });

      if (!targetCol) return;

      client.cache.modify({
        id: client.cache.identify(col),
        fields: {
          i: cachedVal => cachedVal + di,
        },
      });
      client.cache.modify({
        id: client.cache.identify(targetCol),
        fields: {
          i: cachedVal => cachedVal - di,
        }
      })
    }
    else {
      const cols = colDetail.cols.slice();
      cols.splice(col.i, 1, cols[col.i + di]);
      cols.splice(col.i + di, 1, col);
      colVar({
        ...colDetail,
        cols,
        i: col.i + di,
        scroll: sizeDetail.width < MOBILE_WIDTH
          ? true
          : false,
      });
    }
  }
  return { shiftCol }
}