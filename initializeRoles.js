const Role = require('./models/Role');
const mongoose = require('mongoose');
require('dotenv').config();

async function initializeRoles() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    const roles = [
      { name: 'Community Admin' },
      { name: 'Community Moderator' },
      { name: 'Community Member' }
    ];
    
    for (const role of roles) {
      const existingRole = await Role.findOne({ name: role.name });
      if (!existingRole) {
        const newRole = new Role(role);
        await newRole.save();
        console.log(`Created role: ${role.name}`);
      }
    }
    
    console.log('Role initialization complete');
    process.exit(0);
  } catch (err) {
    console.error('Error initializing roles:', err);
    process.exit(1);
  }
}

initializeRoles();