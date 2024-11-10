import { connectToDatabase } from '../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { courseId, userId } = req.body;

  if (!courseId || !userId) {
    return res.status(400).json({ message: 'Course ID and User ID are required' });
  }

  try {
    const { db } = await connectToDatabase();
    
    const result = await db.collection('users').updateOne(
      { 
        userId: userId,
        'courses.courseId': courseId 
      },
      { 
        $inc: { 'courses.$.timeSpent': 10 } 
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'User or course not found' });
    }

    return res.status(200).json({ message: 'View time updated successfully' });
  } catch (error) {
    console.error('Error updating view time:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}



