import { encode } from 'js-base64';
import axios from 'axios';

const createAuth = (au) => {
  console.log(
    `XXXXX base solved with hack: ${typeof encode}`
  );
  return encode(`${au.id}:${au.secret}`);
};

const getToken = (au) => () => {
  const scope = au.scope;
  const auth = createAuth(au);

  const instance = axios.create({
    timeout: 1000,
    headers: {
      authorization: `Basic ${auth}`,
      'content-type': 'application/x-www-form-urlencoded',
    },
  });
  const formData = new URLSearchParams({
    grant_type: 'client_credentials',
    scope,
  });
  return instance
    .post(
      `${au.authUrl}/oauth/${au.projectKey}/anonymous/token`,
      //is axios bugging out on me, works differently in fetch
      // `grant_type=client_credentials&scope=${scope}`,
      // `grant_type=client_credentials&scope=manage_project%3Afrontastic-1`,
      formData
    )
    .catch((e) => console.log('XXXXXX error 88:', e));
};

export const check = async () => {
  const settings = {
    clientId: 88,
    clientSecret: 88,
    scope: 88,
    projectKey: 88,
    authUrl: 88,
  };
  const au = {
    id: settings.clientId,
    secret: settings.clientSecret,
    scope: settings.scope,
    projectKey: settings.projectKey,
    authUrl: settings.authUrl,
  };
  return getToken(au)().then((token) => {
    console.log('XXXXX setting token:', token);
    return token;
  });
};
