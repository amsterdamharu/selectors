import { encode } from 'js-base64';
import axios from 'axios';

const createAuth = (au) => {
  console.log(
    `XXXXX base solved with hack: ${typeof encode}`
  );
  return encode(`${au.id}:${au.secret}`);
};

const getToken = (au) => () => {
  console.log('XXXXX in getToken');
  const auth = createAuth(au);
  return axios
    .post(
      `${au.authUrl}/oauth/${au.projectKey}/anonymous/token`,
      //@todo: how to make this work without offing yourself
      //  got this to work in React app in 5 minutes, getting it
      //  to work in farttastic will take weeks
      `grant_type=client_credentials&scope=${encodeURI(
        au.scope
      )}`,
      {
        timeout: 1000,
        headers: {
          authorization: `Basic ${auth}`,
          'content-type':
            'application/x-www-form-urlencoded',
        },
      }
    )
    .then((response) => {
      //do not log in frontastic, it will crash on
      //  circular data not parsing to json
      console.log('XXXXXX got response', response);
      return response.data;
    })
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
    console.log('XXXXX got token:', token);
    return token;
  });
};
