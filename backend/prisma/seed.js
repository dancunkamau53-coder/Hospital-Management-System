const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const prisma = new PrismaClient();

async function main(){
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@hospital.test';
  const adminPass = process.env.SEED_ADMIN_PASS || 'AdminPass123!';
  const hospitalName = process.env.SEED_HOSPITAL_NAME || 'Demo Hospital';

  // create hospital
  let hosp = await prisma.hospital.findUnique({ where: { email: adminEmail } });
  if(!hosp){
    hosp = await prisma.hospital.create({ data: { name: hospitalName, email: adminEmail, phone: '000' } });
    console.log('Created hospital', hosp.id);
  }

  let user = await prisma.user.findUnique({ where: { email: adminEmail } });
  if(!user){
    const hashed = await bcrypt.hash(adminPass, 10);
    user = await prisma.user.create({ data: { fullName: 'Admin', email: adminEmail, password: hashed, role: 'ADMIN', hospitalId: hosp.id } });
    console.log('Created admin user', user.id);
  }

  const token = jwt.sign({ id: user.id, hospitalId: hosp.id, role: user.role }, process.env.JWT_SECRET || 'hospital_system_super_secure_secret_key', { expiresIn: '7d' });
  console.log('\n---
SEED COMPLETE
JWT=' + token + '\n---');
}

main().catch(e=>{console.error(e); process.exit(1);} ).finally(()=>prisma.$disconnect());
