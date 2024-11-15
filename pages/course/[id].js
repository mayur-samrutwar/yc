import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Star } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/router';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import ycABI from '@/contracts/abi/yc.json';

export default function CourseDetail() {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [videoDetails, setVideoDetails] = useState(null);
  const [error, setError] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [courseDetails, setCourseDetails] = useState(null);
  const [examStatus, setExamStatus] = useState('not_started');
  const router = useRouter();
  const { id } = router.query;

  const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  const { writeContract, data: hash } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const handleMintCertificate = async () => {
    try {
      await writeContract({
        address: CONTRACT_ADDRESS,
        abi: ycABI,
        functionName: 'mint',
        args: [] // mint function doesn't take any arguments as per your ABI
      });
    } catch (error) {
      console.error('Error minting certificate:', error);
      alert('Failed to mint certificate. Please try again.');
    }
  };

  useEffect(() => {
    if (isConfirmed) {
      updateCertificationStatus();
    }
  }, [isConfirmed]);

  const updateCertificationStatus = async () => {
    try {
      const response = await fetch('/api/submit-exam', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: walletAddress.toLowerCase(),
          courseId: id,
          examStatus: 'certified'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update certification status');
      }

      setExamStatus('certified');
    } catch (error) {
      console.error('Error updating certification status:', error);
      alert('Certificate minted but status update failed. Please contact support.');
    }
  };

  useEffect(() => {
    let interval;
    let updateViewTimeInterval;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        interval = setInterval(() => {
          setTimeSpent(prev => prev + 1);
        }, 1000);

        if (isRegistered && walletAddress && id) {
          updateViewTimeInterval = setInterval(async () => {
            try {
              const response = await fetch('/api/update-view-time', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  userId: walletAddress.toLowerCase(),
                  courseId: id
                }),
              });

              if (!response.ok) {
                console.error('Failed to update view time');
              }
            } catch (error) {
              console.error('Error updating view time:', error);
            }
          }, 10000);
        }
      } else {
        clearInterval(interval);
        clearInterval(updateViewTimeInterval);
      }
    };

    handleVisibilityChange();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      clearInterval(updateViewTimeInterval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isRegistered, walletAddress, id]);

  useEffect(() => {
    async function fetchVideoDetails() {
      if (!id) return;
      
      try {
        const response = await fetch(`/api/get-course-details?id=${id}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch video details');
        }
        
        setVideoDetails(data);
        console.log('Video Duration (seconds):', data.duration);
        setError(null);
      } catch (err) {
        setError(err.message);
        setVideoDetails(null);
      }
    }

    fetchVideoDetails();
  }, [id]);

  useEffect(() => {
    const fetchCourseDetailsForUser = async () => {
      if (!walletAddress || !id) return;

      try {
        const response = await fetch('/api/get-user-course-details', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: walletAddress.toLowerCase(), courseId: id }),
        });

        const data = await response.json();
        if (response.ok) {
          console.log('Course details with exam status:', data);
          setCourseDetails(data);
          setIsRegistered(true);
          setExamStatus(data.examStatus || 'not_started');
        } else {
          setCourseDetails(null);
          setIsRegistered(false);
          setExamStatus('not_started');
        }
      } catch (error) {
        console.error('Error fetching course details:', error);
      }
    };

    fetchCourseDetailsForUser();
  }, [walletAddress, id]);

  const handleLogin = async (userId) => {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }
      console.log(data.message); // Handle successful login
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  useEffect(() => {
    const checkWalletConnection = async () => {
      const address = await window.ethereum.request({ method: 'eth_requestAccounts' })
        .then(accounts => accounts[0])
        .catch(() => null);

      if (address) {
        setWalletAddress(address);
        handleLogin(address);
      } else {
        console.log('Wallet not connected');
      }
    };

    checkWalletConnection();
  }, []);

  // Format seconds into MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleRegister = async () => {
    if (!walletAddress) return;

    const userId = walletAddress.toLowerCase();
    const courseId = id;
    const courseDuration = videoDetails?.duration;

    console.log('Registering with the following details:');
    console.log('User ID:', userId);
    console.log('Course ID:', courseId);
    console.log('Course Duration:', courseDuration);

    if (!userId || !courseId || !courseDuration) {
      console.error('Missing required fields for registration');
      return;
    }

    try {
      const response = await fetch('/api/register-for-course', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, courseId, courseDuration }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }
      setIsRegistered(true);
      console.log(data.message);
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background relative">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center text-red-500">
            <h1 className="text-2xl font-semibold mb-4">Error</h1>
            <p>{error}</p>
          </div>
        </main>
      </div>
    );
  }

  if (!videoDetails) {
    return (
      <div className="min-h-screen bg-background relative">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p>Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  // Replace the hardcoded course object with dynamic data
  const course = {
    ...videoDetails,
    rating: 4.8,
    students: "12,345",
    category: "Web Development"
  };

  const progressPercentage = courseDetails?.timeSpent && videoDetails?.duration
    ? (courseDetails.timeSpent / videoDetails.duration) * 100 
    : 0;

  const canTakeExam = progressPercentage >= 70;

  return (
    <div className="min-h-screen bg-background relative">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Video Player */}
            <div className="aspect-video rounded-lg overflow-hidden bg-black">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${course.videoId}`}
                title={course.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            
            {/* Course Info */}
            <div className="mt-6 space-y-4 bg-card rounded-lg border p-6">
              <h1 className="text-2xl font-semibold tracking-tight">{course.title}</h1>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{course.channelName}</span>
                <span>•</span>
                <span>{course.category}</span>
                <span>•</span>
                <span>{course.students} students</span>
              </div>
              
              <div className="border-t pt-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {course.description}
                </p>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-3 pt-2">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      className="focus:outline-none"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHover(star)}
                      onMouseLeave={() => setHover(0)}
                    >
                      <Star
                        className={`h-5 w-5 ${
                          star <= (hover || rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-muted'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-sm font-medium">
                  Rate this course
                </span>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 rounded-lg border bg-card shadow-sm">
              <div className="p-6 space-y-6">
                {/* Course Stats */}
                <div className="space-y-2">
                  <h2 className="text-lg font-semibold tracking-tight">Course Overview</h2>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                    <span>{course.rating} course rating</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-4">
                  {console.log('Rendering with exam status:', examStatus)}
                  {!isRegistered && (
                    <Button className="w-full" size="lg" onClick={handleRegister} disabled={!walletAddress}>
                      Register Now
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    size="lg"
                    disabled={!canTakeExam || !isRegistered}
                    onClick={() => router.push(`/exam/${id}`)}
                  >
                    {canTakeExam ? 'Take Exam' : `Complete ${Math.round(progressPercentage)}% of ${formatTime(videoDetails?.duration || 0)}`}
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full"
                    size="lg"
                    disabled={examStatus !== 'passed' || isConfirming}
                    onClick={handleMintCertificate}
                  >
                    {isConfirming ? 'Minting...' : 
                     examStatus === 'certified' ? 'Certified' :
                     examStatus === 'passed' ? 'Mint Certificate' : 
                     'Complete Exam to Mint'}
                  </Button>

                  {/* Optional: Add a progress indicator */}
                  {isRegistered && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Timer Display */}
      <div className="fixed bottom-4 right-4 bg-card border rounded-lg px-3 py-2 shadow-sm">
        <div className="text-sm font-medium">
          Time Spent: {formatTime(timeSpent)}
        </div>
      </div>
    </div>
  );
}
