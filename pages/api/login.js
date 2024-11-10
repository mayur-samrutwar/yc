import { connectToDatabase } from '../../lib/db'; // Import the database connection

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { userId } = req.body; // Get userId from request body
  const lowerCaseUserId = userId.toLowerCase(); // Convert userId to lowercase

  if (!lowerCaseUserId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  const { db } = await connectToDatabase(); // Connect to the database

  // Check if user exists
  const user = await db.collection('users').findOne({ userId: lowerCaseUserId });

  if (user) {
    // User already exists, log in the user
    return res.status(200).json({ message: 'User logged in', userId: lowerCaseUserId });
  }

  // User does not exist, create a new user
  await db.collection('users').insertOne({
    userId: lowerCaseUserId,
    courses: []
  });
  return res.status(201).json({ message: 'User created', userId: lowerCaseUserId });
}
