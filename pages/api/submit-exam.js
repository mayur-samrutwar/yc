import { connectToDatabase } from '../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { userId, courseId, examStatus } = req.body;

  if (!userId || !courseId || !examStatus) {
    return res.status(400).json({ message: 'User ID, Course ID, and exam status are required' });
  }

  try {
    const { db } = await connectToDatabase();
    
    const result = await db.collection('users').updateOne(
      { 
        userId: userId.toLowerCase(),
        'courses.courseId': courseId 
      },
      { 
        $set: { 
          'courses.$.examStatus': examStatus
        } 
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'User or course not found' });
    }

    return res.status(200).json({ 
      message: 'Exam status updated successfully',
      examStatus
    });

  } catch (error) {
    console.error('Error updating exam status:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
