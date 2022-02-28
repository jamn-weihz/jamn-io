export const DEV_SERVER_URI = 'http://localhost:4000';
export const DEV_WS_SERVER_URI = 'ws://localhost:4000';

export const EMAIL_REGEX = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/

export const GOOGLE_CLIENT_ID = '635639708949-9r46kl0ble8si0o3ptpg2f9ir7hc70pc.apps.googleusercontent.com';

export const REFRESH_ACCESS_TOKEN_TIME = 8 *60 * 1000;

export const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoiamFtbnRjZyIsImEiOiJja3ZqMGk0bmRiZms0MnB0OXNpb2NneGo0In0.nDqGANM1cIwpqVLBl506Vw';

export const DEFAULT_COLOR = '#9575cd';

export const ALGOLIA_APP_ID = '1QR3PN9XCV';
export const ALGOLIA_APP_KEY = '5b9983f85822a5b64d79be432ba9d901';
export const ALGOLIA_INDEX_NAME = process.env.NODE_ENV === 'production'
  ? 'prod_jamn'
  : 'dev_jamn';

export const MOBILE_WIDTH = 420;

export const LOAD_LIMIT = 10;

export const IFRAMELY_API_KEY_DARK='94bfef11d502890ea3be39545c43c2f9';

export const IFRAMELY_API_KEY_LIGHT='ccc8c698f47cd34726d1dde82d931c1f';
