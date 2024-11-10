import { connectToDatabase } from '../../lib/db';
import OpenAI from 'openai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { courseId } = req.body;

  if (!courseId) {
    return res.status(400).json({ message: 'Course ID is required' });
  }

  try {
    const { db } = await connectToDatabase();
    const course = await db.collection('courses').findOne({ courseId });

    if (!course || !course.transcript) {
      return res.status(404).json({ message: 'Course or transcript not found' });
    }

    const openai = new OpenAI({
      apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY
    });

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an exam generator. You must respond with a JSON object containing an array of questions. Each question must follow this exact JSON format: { 'question': 'question text', 'options': ['A) option1', 'B) option2', 'C) option3', 'D) option4'], 'correctAnswer': 'A) option1' }."
        },
        {
          role: "user",
          content: `Generate 10 multiple choice questions based on this transcript and return them as a JSON object with a 'questions' array. Each question should have a question text, four options prefixed with A), B), C), D), and the correct answer must exactly match one of the options. Transcript: ${course.transcript}`
        }
      ],
      model: "gpt-3.5-turbo-1106",
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 2000
    });

    const responseContent = completion.choices[0].message.content;
    
    try {
      const parsedResponse = JSON.parse(responseContent);
      const questions = parsedResponse.questions;

      // Validate question format
      if (!Array.isArray(questions) || !questions.every(q => 
        q.question && 
        Array.isArray(q.options) && 
        q.options.length === 4 && 
        q.correctAnswer && 
        q.options.includes(q.correctAnswer)
      )) {
        throw new Error('Invalid question format');
      }

      console.log('Generated questions:', questions);

      return res.status(200).json({ questions });

    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError, responseContent);
      return res.status(500).json({ 
        message: 'Failed to generate exam questions',
        error: 'Invalid response format'
      });
    }

  } catch (error) {
    console.error('Error in generate-exam:', error);
    return res.status(500).json({ 
      message: 'Failed to generate exam',
      error: error.message
    });
  }
}
