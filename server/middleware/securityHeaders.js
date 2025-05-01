const helmet = require('helmet');

// Basic Helmet setup - we can customize this further in Phase 7
// Content-Security-Policy (CSP) will require careful configuration later based on specific needs.
const setupSecurityHeaders = (app) => {
  app.use(helmet());
  // Consider adding specific configurations later, e.g.,
  // app.use(helmet.contentSecurityPolicy({ directives: { ... } }));
  // app.use(helmet.hsts({ maxAge: 31536000, includeSubDomains: true, preload: true }));
};

module.exports = setupSecurityHeaders;