# Auth Service
A generically useful authentication and authorisation server based on a
heirarchy-free inter-entity permission system.

## Running
To kickstart the service run `npm start`.

## Tests
Tests use [Tape](https://github.com/substack/tape) test harness. To run tests
use `npm test`.

## RethinkDB
To install rethinkDB, run the following:
`brew update && brew install rethinkdb`
To start the RethinkDB Server, run `rethinkdb`.
You can check out the GUI at `http://localhost:8080`.
This window needs to stay open, or the connection will close.

## Schemas

### Generating docs
You can generate and update markdown docs for schemas by running
`node generate_spec_docs.js`.
