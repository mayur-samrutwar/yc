import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function ExamPage() {
  const router = useRouter();
  const { id: courseId } = router.query;
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!courseId) return;

    const generateExam = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/generate-exam', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ courseId }),
        });

        if (!response.ok) {
          throw new Error('Failed to generate exam');
        }

        const data = await response.json();

        console.log('Generated Exam Questions:', data);
        setQuestions(data.questions || []);
        setError(null);
      } catch (error) {
        console.error('Error generating exam:', error);
        setError('Failed to load exam questions. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    generateExam();
  }, [courseId]);

  const handleAnswerSelect = (questionIndex, selectedOption) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: selectedOption
    }));
  };

  const handleSubmit = () => {
    try {
      // Calculate score based on correct answers from questions array
      let correctAnswers = 0;
      questions.forEach((question, index) => {
        if (answers[index] === question.correctAnswer) {
          correctAnswers++;
        }
      });

      const totalQuestions = questions.length;
      const score = Math.round((correctAnswers / totalQuestions) * 100);
      const passed = score >= 70; // Assuming 70% is passing score

      // Display results
      alert(`
        Score: ${score}%
        Correct Answers: ${correctAnswers}/${totalQuestions}
        ${passed ? 'Congratulations! You passed!' : 'Please try again.'}
      `);

      if (passed) {
        router.push(`/course/${courseId}`);
      }

    } catch (error) {
      console.error('Error calculating score:', error);
      alert('Failed to calculate score. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <p>Loading exam questions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={() => router.reload()}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Course Exam</h1>
      
      {questions.map((question, index) => (
        <div key={index} className="mb-8 p-4 border rounded shadow-sm">
          <p className="font-semibold mb-4">{index + 1}. {question.question}</p>
          <div className="space-y-2">
            {question.options.map((option, optionIndex) => (
              <label 
                key={optionIndex} 
                className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="radio"
                  name={`question-${index}`}
                  value={option}
                  checked={answers[index] === option}
                  onChange={() => handleAnswerSelect(index, option)}
                  className="form-radio text-blue-500"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </div>
      ))}

      {questions.length > 0 && (
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">
            {Object.keys(answers).length} of {questions.length} questions answered
          </span>
          <button
            onClick={handleSubmit}
            disabled={Object.keys(answers).length !== questions.length}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit Exam
          </button>
        </div>
      )}
    </div>
  );
}
