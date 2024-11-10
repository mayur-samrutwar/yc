import { connectToDatabase } from '../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { userId, courseId, courseDuration } = req.body;

  if (!userId || !courseId || !courseDuration) {
    return res.status(400).json({ message: 'User ID, Course ID, and Course Duration are required' });
  }

  try {
    const { db } = await connectToDatabase();

    // Check if the user exists
    const user = await db.collection('users').findOne({ userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Add the new course to the user's courses
    await db.collection('users').updateOne(
      { userId },
      {
        $addToSet: {
          courses: {
            courseId,
            courseDuration,
            timeSpent: 0,
            examStatus: 'not_started'
          }
        }
      }
    );

    return res.status(201).json({ message: 'Course registered successfully' });
  } catch (error) {
    console.error('Error registering course:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
