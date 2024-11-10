import { connectToDatabase } from '../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { userId, courseId } = req.body;

  if (!userId || !courseId) {
    return res.status(400).json({ message: 'User ID and Course ID are required' });
  }

  try {
    const { db } = await connectToDatabase();

    // Find the user and the specific course details
    const user = await db.collection('users').findOne(
      { userId },
      { projection: { courses: { $elemMatch: { courseId } } } }
    );

    if (!user || !user.courses || user.courses.length === 0) {
      return res.status(404).json({ message: 'User or course not found' });
    }

    const courseDetails = user.courses[0]; // Get the first matching course

    return res.status(200).json(courseDetails);
  } catch (error) {
    console.error('Error fetching course details:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
