const db = require('../config/db');
const models = require('../models');

async function testStatus() {
  console.log('Before update subadmins:', await models.getAllSubAdmins());
  await models.updateSubAdminStatus(2, 'BUSY');
  console.log('After update subadmins:', await models.getAllSubAdmins());
}

testStatus();
