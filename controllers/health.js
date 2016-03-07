exports.route = function(server) {
  server.get('/health', function(req, res) {
    res.end('ok');
  });
};
