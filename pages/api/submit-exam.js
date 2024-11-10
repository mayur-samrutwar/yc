import { connectToDatabase } from '../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { userId, courseId, answers } = req.body;

  if (!userId || !courseId || !answers) {
    return res.status(400).json({ message: 'User ID, Course ID, and answers are required' });
  }

  try {
    // First, generate the exam questions
    const examResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/generate-exam`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ courseId }),
    });

    if (!examResponse.ok) {
      throw new Error('Failed to generate exam');
    }

    const { questions } = await examResponse.json();

    // Calculate score
    let correctAnswers = 0;
    answers.forEach((userAnswer, index) => {
      if (userAnswer === questions[index].correctAnswer) {
        correctAnswers++;
      }
    });

    const score = (correctAnswers / questions.length) * 100;
    const passed = score >= 50;

    // Update user's exam status in database
    const { db } = await connectToDatabase();
    
    const result = await db.collection('users').updateOne(
      { 
        userId: userId.toLowerCase(),
        'courses.courseId': courseId 
      },
      { 
        $set: { 
          'courses.$.examStatus': passed ? 'passed' : 'failed',
          'courses.$.examScore': score
        } 
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'User or course not found' });
    }

    return res.status(200).json({ 
      score,
      passed,
      totalQuestions: questions.length,
      correctAnswers
    });

  } catch (error) {
    console.error('Error submitting exam:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
