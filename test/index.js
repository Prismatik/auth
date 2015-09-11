var test = require('tape');
var tapSpec = require('tap-spec');

test.createStream()
  .pipe(tapSpec())
  .pipe(process.stdout);

// Feel free to split these tests out into files, write additional ones, etc. Change the runner if you like.
// I've written this spec in the mindset of e2e integration tests. ie: stand up a server and throw queries at it with superagent or request or similar. We should also write unit tests for the actual code as we go.

// Note that I haven't given a great deal of thought to PUT vs POST in these tests, so if it makes sense to substitute, test both, etc, just do it.

test('it should return 403 to a request with no auth', function(t) {
});

test('it should allow an authorised request to POST a User resource', function(t) {
  // Probably just use something like miniauth (https://www.npmjs.com/package/miniauth) for now. The inital use case for this is just something that API services can access. We don't need to worry about end users talking to it directly as yet, though that would be good in the future.
});

test('it should allow an authorised request to GET a User resource after POSTing it', function(t) {
  // POST a User, then GET it back and make sure it looks the way we expect
});

test('it should reject the POST of a malformed User resource', function(t) {
});

test('it should reject the POST of a malformed User resource', function(t) {
});

test('it should enforce that emails are unique', function(t) {
  // Try and POST two users with the same email address in their emails array. It should accept the first and reject the second.
});

test('it should create a session given the correct password for a UID', function(t) {
  // Set up a user, then POST to /login with the user's UID and password. It should return a Session
  // Then GET that User. It should have that same Session in the sessions array
});

test('it should create a session given the correct password and an email', function(t) {
  // Set up a user, then POST to /login with the user's email and password. It should return a Session
  // Then GET that User. It should have that same Session in the sessions array
});

test('it should not create a session given the incorrect password', function(t) {
});

test('it should return the User associated with a valid Session ID', function(t) {
  // GET /users?sess=some_uuid should return the User you expect it to. To stay RESTful this should be an array that only ever has one element.
});

test('it should not return any User given an invalid Session ID', function(t) {
});

test('it should return the User associated with a valid email', function(t) {
  // GET /users?email=some_email should return the User you expect it to. To stay RESTful this should be an array that only ever has one element.
});

test('it should not return any User given an invalid email', function(t) {
});

test('it should return the User associated with a valid ID', function(t) {
  // GET /users/some_uuid should return the User you expect it to
});

test('it should not return any User given an invalid ID', function(t) {
});

test('it should return all Users with a given permission', function(t) {
  // GET /users?perm.type=membership&perm.entity=some_uuid should return an Array of the Users you expect it to
});

test('it should not return any User given an invalid permission', function(t) {
  // Empty array and a 404
});

test('it should allow composition of filters and paramaters', function(t) {
  // GET /users/some_uuid?perm.type=membership&perm.entity=some_uuid should return a User if the User described by that uuid has the requested permission. If they don't have the requested permission it should 404

  // GET /users?perm.type=membership&perm.entity=some_uuid&email=some_email should return a User if the User described by that email has the requested permission. If they don't have the requested permission it should 404
});

test('it should allow a User to be updated if the rev property matches the existing representation in the database', function(t) {
  // CouchDB style
});

test('it should not allow a User to be updated if the rev property does not match the existing representation in the database', function(t) {
});

test('it should properly set the created_at property of a User on creation', function(t) {
});

test('it should properly set the updated_at property of a User at update', function(t) {
});
