import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

import('../dist/server/production.mjs').catch(()=>{}); // no-op if built

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI not set');
  process.exit(1);
}

await mongoose.connect(uri);
console.log('Connected to MongoDB');

const usersColl = mongoose.connection.collection('users');
const studentsColl = mongoose.connection.collection('students');

const studentEmail = 'aarav.student@school.org';
const studentPassword = 'StudentPass#1';

// Find a student to link (Aarav Kumar)
const studentDoc = await studentsColl.findOne({ name: 'Aarav Kumar' });
if (!studentDoc) {
  console.error('Student not found.');
  process.exit(1);
}

let user = await usersColl.findOne({ email: studentEmail });
if (!user) {
  const hash = await bcrypt.hash(studentPassword, 10);
  const res = await usersColl.insertOne({ name: 'Aarav Kumar', email: studentEmail, password: hash, role: 'student', createdAt: new Date(), updatedAt: new Date() });
  user = await usersColl.findOne({ _id: res.insertedId });
  console.log('Created student user:', studentEmail);
} else {
  console.log('Student user already exists');
}

// Update student document to include userId
await studentsColl.updateOne({ _id: studentDoc._id }, { $set: { userId: user._id } });
console.log('Linked student document to user.');

await mongoose.disconnect();
console.log('Done.');
