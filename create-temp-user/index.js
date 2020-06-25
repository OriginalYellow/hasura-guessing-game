const jwt = require('jsonwebtoken')
const fetch = require('node-fetch')
const fs = require('fs')
const { json } = require('micro')

const HASURA_OPERATION = `
mutation insertUserOne($name: String) {
  insert_user_one(object: {name: $name}) {
    id
    name
  }
}
`;

// execute the parent operation in Hasura
const execute = async (variables) => {
  const fetchResponse = await fetch(
    "http://localhost:8080/v1/graphql",
    {
      method: 'POST',
      body: JSON.stringify({
        query: HASURA_OPERATION,
        variables
      }),
      headers: {
        // MIKE: replace this with an env var
        'x-hasura-admin-secret': 'HVVTa3PSDocVJvbliFlu'
      }
    }
  );

  const data = await fetchResponse.json();
  return data;
};

// Request Handler
const handler = async (req, res) => {
  let reqData = null
  try {
    reqData = await json(req);
  } catch (e) {
    // MIKE: this will throw silently and return an empty object
    reqData = {}
  }

  // get request input
  const { name } = reqData.input;

  // run some business logic

  // execute the Hasura operation
  const { data, errors } = await execute({ name });

  // if Hasura operation errors, then throw error
  if (errors) {
    return res.status(400).json(errors[0])
  }

  // create token and add hasura claims
  const hasuraNamespace = "https://hasura.io/jwt/claims";

  const hasuraClaims = {
    "x-hasura-default-role": "user",
    "x-hasura-allowed-roles": ["user"],
    "x-hasura-user-id": `${data.insert_user_one.id}`
  };

  var privateKey = fs.readFileSync('private.key');

  var token = jwt.sign(
    {
      ...data.insert_user_one,
      [hasuraNamespace]: hasuraClaims
    },
    privateKey,
    { algorithm: 'RS256' }
  )

  // send response
  return {
    ...data.insert_user_one,
    token
  }

};

module.exports = handler;