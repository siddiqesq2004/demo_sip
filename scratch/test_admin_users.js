const adminService = require('../backend/services/adminService');

async function test() {
  const users = await adminService.getAdminUsersList();
  console.log('Admin Users List Count:', users.length);
  console.log('Admin Users Item 0:', users[0]);
}

test().catch(console.error);
