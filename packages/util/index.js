import fetch from 'node-fetch'

export const executeQuery = (endpoint, headers) => async (query, variables) => {
  const fetchResponse = await fetch(
    endpoint,
    {
      method: 'POST',
      body: JSON.stringify({
        query: query,
        variables
      }),
      headers
    }
  );

  const data = await fetchResponse.json();
  return data;
};

export const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min)) + min;
}
