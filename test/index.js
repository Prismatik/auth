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

test('it should create a session given the correct password for a UID', function(t) {
  // Set up an entity, then POST to /login with the entity's UID and password. It should return a Session
  // Then GET that Entity. It should have that same Session in the sessions array
});

test('it should create a session given the correct password and an email', function(t) {
  // Set up an entity, then POST to /login with the entity's email and password. It should return a Session
  // Then GET that Entity. It should have that same Session in the sessions array
});

test('it should not create a session given the incorrect password', function(t) {
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

test('it should allow an Entity to be updated if the rev property matches the existing representation in the database', function(t) {
  // CouchDB style
});

test('it should not allow an Entity to be updated if the rev property does not match the existing representation in the database', function(t) {
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
   * There are four Entities in the system. Adam and Chai are users. Team and Coaches are groups. Adam and Chai both hold the permission `member` over Team. Adam holds the permission `owner` over Coaches. Coaches holds the permission `admin` over Team. Adam has the permission `admin` over Team.
  **/

  // When we want to generate the inherited permissions array for an Entity we need to recursively walk the chain of other Entities they're associated with.
  // That's not so bad in the case of getting a single Entity by ID and generating the inherited array for it.
  // Where it gets a little gnarly is when we want to find all Entities that have a given permission over a given entity. If this search is to include inherited permissions (which it _must_ in order to be useful) then in the worst case we must walk the graph for every Entity in the system.
  // That's obviously silly, but there must be a better way to do it.
  // In a document database we could just have the inherited_permissions array be always populated in the document. The problem sets in when we remove the permission `owner` from Managers, we must then go and modify Alice's inherited_permissions array.
  // I can't at this minute figure out what we'd do in an RDBMS. My brain is saying that foreign keys would only get us one layer of inheritance rather than n layers, but I might be wrong about that in either direction.
  // I suspect that the correct answer is _probably_ a graph database. I know stuff all about them, though.
  // Maybe something like RethinkDB's composable filters would give us what we need, but I'm not sure how it'd handle the recursion.
});
