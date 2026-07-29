'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Send, Loader, Lightbulb, CheckCircle, Clock } from 'lucide-react';

interface Question {
  id: string;
  question: string;
  author: string;
  askedAt: string;
  answer: string;
  isAnswered: boolean;
  answerStatus: string;
  aiSuggestedAnswer: string;
  aiConfidence: string;
  questionCategory: string;
  upvotes: number;
}

export default function QADashboard({ locationId }: { locationId: string }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [unansweredQuestions, setUnansweredQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [answerText, setAnswerText] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'unanswered'>('unanswered');
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, [locationId]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [questionsRes, analyticsRes] = await Promise.all([
        fetch(`/api/locations/${locationId}/qa/questions/unanswered`),
        fetch(`/api/locations/${locationId}/qa/analytics`)
      ]);
      const questionsData = await questionsRes.json();
      const analyticsData = await analyticsRes.json();
      setUnansweredQuestions(questionsData.content || []);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Failed to fetch Q&A data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const answerQuestion = async () => {
    if (!selectedQuestion || !answerText.trim()) {
      alert('Please enter an answer');
      return;
    }

    try {
      const response = await fetch(
        `/api/locations/${locationId}/qa/questions/${selectedQuestion.id}/answer`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answer: answerText })
        }
      );

      const updatedQuestion = await response.json();
      setUnansweredQuestions(unansweredQuestions.filter(q => q.id !== selectedQuestion.id));
      setSelectedQuestion(null);
      setAnswerText('');
      fetchData(); // Refresh analytics
    } catch (error) {
      console.error('Failed to answer question:', error);
      alert('Failed to submit answer');
    }
  };

  const useAiSuggestion = (aiAnswer: string) => {
    setAnswerText(aiAnswer);
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <MessageSquare size={28} className="text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Customer Q&A</h2>
            <p className="text-gray-600">Manage questions and improve customer engagement</p>
          </div>
        </div>

        {/* Analytics Cards */}
        {analytics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <p className="text-sm text-gray-600 font-medium">Total Questions</p>
              <p className="text-2xl font-bold text-blue-600">{analytics.totalQuestions}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <p className="text-sm text-gray-600 font-medium">Answered</p>
              <p className="text-2xl font-bold text-green-600">{analytics.answeredQuestions}</p>
            </div>
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <p className="text-sm text-gray-600 font-medium">Unanswered</p>
              <p className="text-2xl font-bold text-red-600">{analytics.unansweredQuestions}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <p className="text-sm text-gray-600 font-medium">Answer Rate</p>
              <p className="text-2xl font-bold text-purple-600">{Math.round(analytics.answerRate || 0)}%</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Questions List */}
        <div className="lg:col-span-1">
          <div className="mb-4">
            <h3 className="font-bold text-gray-900 mb-3">Unanswered Questions ({unansweredQuestions.length})</h3>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader size={24} className="animate-spin text-gray-400" />
            </div>
          ) : unansweredQuestions.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle size={40} className="mx-auto text-green-600 mb-2" />
              <p className="text-gray-600">All questions answered!</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {unansweredQuestions.map((q) => (
                <button
                  key={q.id}
                  onClick={() => setSelectedQuestion(q)}
                  className={`w-full text-left p-3 rounded-lg border-2 transition ${
                    selectedQuestion?.id === q.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-blue-300'
                  }`}
                >
                  <p className="font-medium text-gray-900 text-sm mb-1">{q.author}</p>
                  <p className="text-sm text-gray-600 line-clamp-2">{q.question}</p>
                  <div className="flex gap-2 mt-2">
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      {q.questionCategory}
                    </span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(q.askedAt).toLocaleDateString()}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Answer Panel */}
        <div className="lg:col-span-2">
          {selectedQuestion ? (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              {/* Question */}
              <div className="mb-6 pb-4 border-b border-gray-200">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Question from {selectedQuestion.author}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(selectedQuestion.askedAt).toLocaleString()}
                    </p>
                  </div>
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                    {selectedQuestion.questionCategory}
                  </span>
                </div>
                <p className="text-lg text-gray-900 font-medium">{selectedQuestion.question}</p>
              </div>

              {/* AI Suggestion */}
              {selectedQuestion.aiSuggestedAnswer && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Lightbulb size={20} className="text-yellow-600 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 mb-2">AI Suggested Answer</p>
                      <p className="text-gray-700 text-sm mb-3">{selectedQuestion.aiSuggestedAnswer}</p>
                      <div className="flex gap-2">
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                          Confidence: {selectedQuestion.aiConfidence}
                        </span>
                        <button
                          onClick={() => useAiSuggestion(selectedQuestion.aiSuggestedAnswer)}
                          className="text-xs bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700 transition"
                        >
                          Use This Answer
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Answer Input */}
              <div className="mb-4">
                <label className="block font-medium text-gray-900 mb-2">Your Answer</label>
                <textarea
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  placeholder="Write your answer to help customers..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  rows={5}
                />
                <p className="text-xs text-gray-500 mt-2">Keep answers professional and helpful</p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={answerQuestion}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-medium"
                >
                  <Send size={18} />
                  Publish Answer
                </button>
                <button
                  onClick={() => {
                    setSelectedQuestion(null);
                    setAnswerText('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-12 text-center">
              <MessageSquare size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Select a question to answer</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
