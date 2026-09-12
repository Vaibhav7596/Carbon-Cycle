const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../.env') });

const mongoose = require('mongoose');
const dns = require('dns');

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}
const User = require('./models/User');

const seedUsers = [
  {
    name: 'Vaibhav Patel',
    email: 'generator@carboncycle.io',
    password: 'Password123!',
    role: 'generator',
    organizationName: 'Gandhinagar Farmers Co-op',
    organizationType: 'Agricultural Enterprise',
    location: 'Gandhinagar, Gujarat',
  },
  {
    name: 'Suresh Kumar',
    email: 'facility@carboncycle.io',
    password: 'Password123!',
    role: 'facility_operator',
    organizationName: 'Gujarat EcoChar Pyrolysis Center',
    organizationType: 'Conversion Facility Operator',
    location: 'Gandhinagar Bio-Park, Gujarat',
  },
  {
    name: 'Admin Controller',
    email: 'admin@carboncycle.io',
    password: 'AdminPass123!',
    role: 'admin',
    organizationName: 'CarbonCycle System Administration',
    organizationType: 'Network Administrator',
    location: 'Gandhinagar HQ, Gujarat',
  },
];

const seedDB = async () => {
  try {
    console.log('[Seeder]: Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/carboncycle');
    console.log('[Seeder]: Connected.');

    console.log('[Seeder]: Clearing existing user collection...');
    await User.deleteMany({});

    console.log('[Seeder]: Creating demo accounts...');
    for (const userData of seedUsers) {
      await User.create(userData);
      console.log(`  ✓ Created [${userData.role.toUpperCase()}]: ${userData.email}`);
    }

    console.log('[Seeder]: Database successfully seeded!');
    process.exit(0);
  } catch (error) {
    console.error('[Seeder Error]:', error.message);
    process.exit(1);
  }
};

seedDB();
