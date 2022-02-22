import { gql } from '@apollo/client';

export const USER_FIELDS = gql`
  fragment UserFields on User {
    id
    focusId
    name
    lowercaseName
    email
    description
    color
    verifyEmailDate
    lng
    lat
    mapLng
    mapLat
    mapZoom
    deleteDate
  }
`;

export const COL_FIELDS = gql`
  fragment ColFields on Col {
    id
    userId
    pathname
    i
    deleteDate
  }
`

export const FULL_USER_FIELDS = gql`
  fragment FullUserFields on User {
    ...UserFields
    cols {
      ...ColFields
    }
  }
  ${USER_FIELDS}
  ${COL_FIELDS}
`;

export const JAM_FIELDS = gql`
  fragment JamFields on Jam {
    id
    focusId
    name
    lowercaseName
    description
    color
    lng
    lat
    deleteDate
  }
`;

export const ROLE_FIELDS = gql`
  fragment RoleFields on Role {
    id
    userId
    jamId
    type
    deleteDate
  }
`;

export const POST_FIELDS = gql`
  fragment PostFields on Post {
    id
    userId
    jamId
    name
    description
    draft
    privacy
    prevCount
    nextCount
    saveDate
    commitDate
    deleteDate
  }
`;

export const FULL_POST_FIELDS = gql`
  fragment FullPostFields on Post {
    ...PostFields
    user {
      id
      name
      color
    }
    jam {
      id
      name
      color
    }
  }
  ${POST_FIELDS}
`;

export const LINK_FIELDS = gql`
  fragment LinkFields on Link {
    id
    sourcePostId
    targetPostId
    weight
    deleteDate
  }
`;

export const VOTE_FIELDS = gql`
  fragment VoteFields on Vote {
    id
    userId
    linkId
    sourcePostId
    targetPostId
    weight
    deleteDate
  }
`