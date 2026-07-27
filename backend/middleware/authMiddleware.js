const { verifyToken } = require('../utils/jwtUtils');
const { sendError } = require('../utils/responseHandler');

function authenticateUser(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 'Authorization token missing or invalid format', null, 401);
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded || decoded.role !== 'user') {
    return sendError(res, 'Invalid or expired user session token', null, 401);
  }

  req.user = decoded;
  next();
}

function authenticateAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 'Admin authorization token missing', null, 401);
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded || decoded.role !== 'admin') {
    return sendError(res, 'Access denied. Admin privileges required.', null, 403);
  }

  req.admin = decoded;
  next();
}

module.exports = {
  authenticateUser,
  authenticateAdmin
};
