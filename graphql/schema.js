const fs = require('fs');
const path = require('path');
const { buildSchema } = require('graphql');

const sdl = fs.readFileSync(path.join(__dirname, 'schema.graphql'), 'utf8');

module.exports = buildSchema(sdl);
