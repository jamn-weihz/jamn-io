import { gql, useMutation, useReactiveVar } from "@apollo/client";
import { snackbarVar, userVar } from "../cache";

const UPDATE_USER_MAP = gql`
  mutation UpdateUserMap($lng: Float!, $lat: Float!, $zoom: Float!) {
    updateUserMap(lng: $lng, lat: $lat, zoom: $zoom) {
      id
      mapLng
      mapLat
      mapZoom
    }
  }
`;

export default function useUpdateUser() {
  const userDetail = useReactiveVar(userVar);

  const [updateMap] = useMutation(UPDATE_USER_MAP, {
    onError: error => {
      console.error(error);
      if (error.message === 'Unauthorized') {
        snackbarVar({
          isUnauthorized: true,
          isSessionExpired: false,
        });
      }
    },
    onCompleted: data => {
      console.log(data);
    },
  });

  const updateUserMap = (lng: number, lat: number, zoom: number) => {
    if (!userDetail?.id) return;
    updateMap({
      variables: {
        lng,
        lat,
        zoom,
      }
    });
  };

  return { updateUserMap };
}