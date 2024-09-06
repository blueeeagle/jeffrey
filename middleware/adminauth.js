module.exports = {
    authenticateAdmin: function(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect("/");
  },
  isLoggedOut: function(req, res, next) {
    if (!req.isAuthenticated()) {
      return next();
    }
    res.redirect("/");
  },
  hasRole: function(role) {
    return function(req, res, next) {
      if (req.isAuthenticated() && req.user && req.user.role === role) {
        return next();
      }
      res.redirect("/");
    };
  },
  hasRolePermission: function(allowedRoles) {
    return function(req, res, next) {
      if (
        req.isAuthenticated() &&
        req.user &&
        allowedRoles.includes(req.user.role)
      ) {
        return next();
      }
      res.redirect("/");
    };
  },
};