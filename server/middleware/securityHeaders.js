const helmet = require('helmet');

// Adding a Content Security Policy (CSP) to restrict allowed sources
const setupSecurityHeaders = (app) => {
  app.use(helmet());
  app.use(helmet.frameguard({ action: 'deny' }));
  app.use(helmet.noSniff());
  app.use(helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://trusted-scripts.example.com"],
      styleSrc: ["'self'", "'unsafe-inline'"]
    }
  }));
};

module.exports = setupSecurityHeaders;