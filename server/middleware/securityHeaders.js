const helmet = require('helmet');

// Adding a Content Security Policy (CSP) to restrict allowed sources
const setupSecurityHeaders = (app) => {
  app.use(helmet());
  app.use(helmet.frameguard({ action: 'deny' }));
  app.use(helmet.noSniff());
  app.use(helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", `${process.env.CLIENT_URL}`],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "https://cdn.jsdelivr.net"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'"],
      frameAncestors: ["'none'"],
    },
  }));
};

module.exports = setupSecurityHeaders;