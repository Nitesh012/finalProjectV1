import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI not set');
  process.exit(1);
}

await mongoose.connect(uri, { dbName: undefined });
console.log('Connected to MongoDB');

const usersColl = mongoose.connection.collection('users');
const studentsColl = mongoose.connection.collection('students');
const assessmentsColl = mongoose.connection.collection('assessments');
const remedialColl = mongoose.connection.collection('remedialplans');
const resourcesColl = mongoose.connection.collection('resources');

const now = new Date();

// Upsert users
const adminEmail = 'admin@school.org';
const teacherEmail = 'teacher@school.org';

const adminHash = await bcrypt.hash('AdminPass#1', 10);
const teacherHash = await bcrypt.hash('TeacherPass#1', 10);

await usersColl.updateOne(
  { email: adminEmail },
  { $set: { name: 'System Admin', email: adminEmail, password: adminHash, role: 'admin', updatedAt: now }, $setOnInsert: { createdAt: now } },
  { upsert: true }
);
await usersColl.updateOne(
  { email: teacherEmail },
  { $set: { name: 'Mrs. Sharma', email: teacherEmail, password: teacherHash, role: 'teacher', updatedAt: now }, $setOnInsert: { createdAt: now } },
  { upsert: true }
);

const admin = await usersColl.findOne({ email: adminEmail });
const teacher = await usersColl.findOne({ email: teacherEmail });

// Insert sample students
const s1 = {
  name: 'Aarav Kumar',
  class: '5A',
  assessments: [],
  remedialPlans: [],
  createdAt: now,
  updatedAt: now,
};
const s2 = {
  name: 'Ananya Gupta',
  class: '5B',
  assessments: [],
  remedialPlans: [],
  createdAt: now,
  updatedAt: now,
};

const r1 = await studentsColl.findOne({ name: s1.name });
let res1;
if (!r1) res1 = await studentsColl.insertOne(s1);
else res1 = { insertedId: r1._id };

const r2 = await studentsColl.findOne({ name: s2.name });
let res2;
if (!r2) res2 = await studentsColl.insertOne(s2);
else res2 = { insertedId: r2._id };

const studentId1 = res1.insertedId;
const studentId2 = res2.insertedId;

// Insert assessments
const a1 = {
  studentId: studentId1,
  subject: 'Mathematics',
  score: 48,
  date: new Date('2025-01-15'),
  createdAt: now,
  updatedAt: now,
};
const a2 = {
  studentId: studentId2,
  subject: 'English',
  score: 76,
  date: new Date('2025-01-12'),
  createdAt: now,
  updatedAt: now,
};

await assessmentsColl.updateOne(
  { studentId: a1.studentId, subject: a1.subject, date: a1.date },
  { $setOnInsert: a1 },
  { upsert: true }
);
await assessmentsColl.updateOne(
  { studentId: a2.studentId, subject: a2.subject, date: a2.date },
  { $setOnInsert: a2 },
  { upsert: true }
);

// Link assessments to students
await studentsColl.updateOne({ _id: studentId1 }, { $addToSet: { assessments: a1._id || (await assessmentsColl.findOne({ studentId: studentId1, subject: a1.subject }))._id } });
await studentsColl.updateOne({ _id: studentId2 }, { $addToSet: { assessments: a2._id || (await assessmentsColl.findOne({ studentId: studentId2, subject: a2.subject }))._id } });

// Insert remedial plan for student 1
const plan = {
  studentId: studentId1,
  planDetails: 'Phonics practice 20 min daily, visual aids for fractions, weekly teacher check-ins',
  assignedBy: teacher.email,
  progress: 10,
  createdAt: now,
  updatedAt: now,
};
await remedialColl.updateOne(
  { studentId: plan.studentId, assignedBy: plan.assignedBy },
  { $setOnInsert: plan },
  { upsert: true }
);

// Link remedial to student
const remedialDoc = await remedialColl.findOne({ studentId: plan.studentId, assignedBy: plan.assignedBy });
if (remedialDoc) {
  await studentsColl.updateOne({ _id: plan.studentId }, { $addToSet: { remedialPlans: remedialDoc._id } });
}

// Insert resources
const resource1 = {
  title: 'Fraction Tiles Activity',
  description: 'Hands-on visual activity using fraction tiles to support conceptual understanding.',
  method: 'Visual Aids',
  uploadedBy: teacher.email,
  createdAt: now,
  updatedAt: now,
};
await resourcesColl.updateOne({ title: resource1.title }, { $setOnInsert: resource1 }, { upsert: true });

console.log('Seed complete.');

await mongoose.disconnect();
console.log('Disconnected.');
