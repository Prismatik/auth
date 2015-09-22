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

test('it should allow an authorised request to POST an Entity resource', function(t) {
  // Probably just use something like miniauth (https://www.npmjs.com/package/miniauth) for now. The inital use case for this is just something that API services can access. We don't need to worry about end users talking to it directly as yet, though that would be good in the future.
});

test('it should allow an authorised request to GET an Entity resource after POSTing it', function(t) {
  // POST an Entity, then GET it back and make sure it looks the way we expect
});

test('it should reject the POST of a malformed Entity resource', function(t) {
});

test('it should reject the POST of a malformed Entity resource', function(t) {
});

test('it should enforce that emails are unique', function(t) {
  // Try and POST two entities with the same email address in their emails array. It should accept the first and reject the second.
});

test('it should create a token given the correct password for a UID', function(t) {
  // Set up an entity, then POST to /login with the entity's UID and password. It should return a token
});

test('it should create a token given the correct password and an email', function(t) {
  // Set up an entity, then POST to /login with the entity's email and password. It should return a token
});

test('it should not create a token given the incorrect password', function(t) {
});

test('it should return the Entity associated with a valid Session ID', function(t) {
  // GET /entities?sess=some_uuid should return the Entity you expect it to. To stay RESTful this should be an array that only ever has one element.
});

test('it should not return any Entity given an invalid Session ID', function(t) {
});

test('it should return the Entity associated with a valid email', function(t) {
  // GET /entities?email=some_email should return the Entity you expect it to. To stay RESTful this should be an array that only ever has one element.
});

test('it should not return any Entity given an invalid email', function(t) {
});

test('it should return the Entity associated with a valid ID', function(t) {
  // GET /entities/some_uuid should return the Entity you expect it to
});

test('it should not return any Entity given an invalid ID', function(t) {
});

test('it should return all Entities with a given permission', function(t) {
  // GET /entities?perm.type=membership&perm.entity=some_uuid should return an Array of the Entities you expect it to
});

test('it should not return any Entity given an invalid permission', function(t) {
  // Empty array and a 404
});

test('it should allow composition of filters and paramaters', function(t) {
  // GET /entities/some_uuid?perm.type=membership&perm.entity=some_uuid should return an Entity if the Entity described by that uuid has the requested permission. If they don't have the requested permission it should 404

  // GET /entities?perm.type=membership&perm.entity=some_uuid&email=some_email should return an Entity if the Entity described by that email has the requested permission. If they don't have the requested permission it should 404
});

test('it should properly set the created_at property of an Entity on creation', function(t) {
});

test('it should properly set the updated_at property of an Entity at update', function(t) {
});

test('it should understand inheritance of permissions', function(t) {
  /**
   * There are three Entities in the system. Alice and Bob are users. Managers is a group. Alice has the permission `owner` over Managers. Managers has the permission `owner` over Bob. Therefore, Alice has the permission `owner` over Bob.
  **/

  /**
   * There are three Entities in the system. Steve and Georgina are users. Company is a group. Georgina has the permission `member` of Company. Steve has the permission `owner` of Company. Company has no permissions. Steve does not have any permissions over Georgina.
  **/

  /**
   * Inheritance must be linear. There are three entities in the system. Francois is a user. Le Boulangerie and Gazza's Beans are groups. Francois holds the permission `purchaser` over Le Boulangerie. Le Boulangerie holds the permission `customer` over Gazza's Beans. Francois must _not_ be a customer of Gazza's Beans.
  **/

  // We should use a document store for this and calculate all the inherited_permissions at write time. This will mean that writes are slow, but reads are super fast. That's totally fine for this use case.
  // The logic to update all of the inherited permissions at write time will be a little messy with some recursion, but that's okay.
});

test('it should not allow a circular inheritance structure to be created', function(t) {
  /**
   * Create three entities, one, two and three.
   * Give one permission over two
   * Give two permission over three
   * Everything should be okay
   * Attempt to give three permission over one
   * You should get a 4xx and the permission should not be added
  **/
});
