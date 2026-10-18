const { sequelize, User } = require('./database');
const bcrypt = require('bcrypt');

const DEMO_USERS = [
  { email: "user@demo.com", password: "password", role: "user", name: "Demo User" },
  { email: "reader@demo.com", password: "password", role: "reader", name: "Demo Reader" },
  { email: "consultant@demo.com", password: "password", role: "consultant", name: "Demo Consultant" },
  { email: "admin@demo.com", password: "password", role: "admin", name: "Demo Admin" }
];

async function seed() {
  await sequelize.sync({ force: false }); // Ensure DB is created
  
  for (const user of DEMO_USERS) {
    const existing = await User.findOne({ where: { email: user.email } });
    if (!existing) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await User.create({
        name: user.name,
        email: user.email,
        password: hashedPassword,
        role: user.role
      });
      console.log(`Seeded ${user.email}`);
    } else {
      console.log(`${user.email} already exists`);
    }
  }
  
  console.log("Seeding complete.");
}

seed().catch(console.error);
