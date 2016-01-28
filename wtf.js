var bcrypt = require('root/lib/bcrypt');

bcrypt.compareAsync('eVmXazS3jsJ3CozuyXB8WInflmjfGd', '$2a$10$s1lC8R.SS/qhR95mPZn5AOz32/UmlavXx7LLMJb1pUVxsfE.Z2Nvq')
.then( console.log );
