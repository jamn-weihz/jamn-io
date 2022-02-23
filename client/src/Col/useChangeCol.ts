import { gql, useApolloClient, useMutation, useReactiveVar } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { colVar, userVar } from '../cache';
import { COL_FIELDS } from '../fragments';
import { Col } from '../types/Col';

const SAVE_COL = gql`
  mutation SaveCol($colId: String!, $pathname: String!) {
    saveCol(colId: $colId, pathname: $pathname) {
      id
      pathname
    }
  }
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
    }
    else {
      colVar({
        ...colDetail,
        cols: colDetail.cols.map(col_i => {
          if (col_i.id === col.id) {
            return {
              ...col_i,
              pathname,
            }
          }
          return col_i;
        }),
      });
    }
  }
  return { changeCol };
}