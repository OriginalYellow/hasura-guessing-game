const jsonFormat = require('json-format')
const jwt = require('jsonwebtoken')
const fetch = require('node-fetch')
const fs = require('fs')
const { json, createError } = require('micro')
const generateName = require('./generateName')

const HASURA_OPERATION = `
mutation insertUserOne($name: String) {
  insert_user_one(object: {name: $name}) {
    id
    name
  }
}
`;

const UNIQUE_NAME_VIOLATION_MESSAGE = 'Uniqueness violation. duplicate key value violates unique constraint "user_name_key"'

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
  var { name } = reqData.input;

  // run some business logic
  var data = null
  
  // generate a random name if name is not provided
  if (name == '') {
    // generate new random names until a unqiue one is found
    while(true) {
      name = generateName()
      const executeRet = await execute({ name });
      const errors = executeRet.errors
  
      if (!errors) {
        data = executeRet.data
        break
      } else if (errors[0].message == UNIQUE_NAME_VIOLATION_MESSAGE) {
        continue
      } else {
        throw createError(500, jsonFormat(errors[0]))
      }
    }
  // else use the provided name 
  } else {
    var executeRet = await execute({ name });

    if (executeRet.errors) {
      throw createError(500, jsonFormat(executeRet.errors[0]))
    } else {
      data = executeRet.data
    }
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