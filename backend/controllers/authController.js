const bcrypt = require('bcryptjs');
const models = require('../models');
const { generateToken } = require('../utils/jwtUtils');
const { sendSuccess, sendError } = require('../utils/responseHandler');

async function loginUser(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return sendError(res, 'Email and password are required', ['email or password missing'], 400);
    }

    const user = await models.findUserByEmail(email);
    if (!user) {
      return sendError(res, 'Invalid credentials', ['User not found with provided email'], 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return sendError(res, 'Invalid credentials', ['Password mismatch'], 401);
    }

    const token = generateToken({ id: user.id, email: user.email, name: user.name, role: 'user' });

    return sendSuccess(res, 'Login successful', {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    return sendError(res, 'Internal server error during authentication', err.message, 500);
  }
}

async function loginAdmin(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return sendError(res, 'Email and password are required', ['email or password missing'], 400);
    }

    const admin = await models.findAdminByEmail(email);
    if (!admin) {
      return sendError(res, 'Invalid admin credentials', ['Admin user not found'], 401);
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return sendError(res, 'Invalid admin credentials', ['Password mismatch'], 401);
    }

    const isSuper = admin.is_super_admin === true;
    const token = generateToken({ 
      id: admin.id, 
      email: admin.email, 
      name: admin.name, 
      role: 'admin',
      admin_role: admin.role || (isSuper ? 'SUPER_ADMIN' : 'SUB_ADMIN'),
      permissions: admin.permissions || (isSuper ? 'ALL_PERMISSIONS' : 'WITHDRAWALS_ONLY'),
      is_super_admin: isSuper
    });

    return sendSuccess(res, 'Admin authentication successful', {
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role || (isSuper ? 'SUPER_ADMIN' : 'SUB_ADMIN'),
        permissions: admin.permissions || (isSuper ? 'ALL_PERMISSIONS' : 'WITHDRAWALS_ONLY'),
        status: admin.status || 'FREE',
        is_super_admin: isSuper
      }
    });
  } catch (err) {
    return sendError(res, 'Internal server error during admin authentication', err.message, 500);
  }
}

module.exports = {
  loginUser,
  loginAdmin
};
