const models = require('../backend/models');
const userService = require('../backend/services/userService');
const adminService = require('../backend/services/adminService');

async function test() {
  console.log('--- TESTING PROFILE PHOTO SAVE ---');
  const dummyAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80';
  await models.updateUserAvatar(1, dummyAvatar);

  console.log('\n--- GET USER PROFILE ---');
  const prof = await userService.getUserProfile(1);
  console.log('User Profile Avatar URL:', prof.user.avatar_url);

  console.log('\n--- GET ADMIN WITHDRAWALS LIST ---');
  const withdrawals = await adminService.getAdminWithdrawalsList({ is_super_admin: true });
  console.log('Withdrawals Item 0:', withdrawals[0]);

  console.log('\n--- GET ADMIN SUPPORT CHATS ---');
  const chats = await adminService.getAdminSupportChatsList({ is_super_admin: true });
  console.log('Support Chat Item 0:', chats[0]);
}

test().catch(console.error);
