import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ReclaimProofRequest } from '@reclaimprotocol/js-sdk';
import QRCode from "react-qr-code";
import { Loader, Plus, Book } from "lucide-react";

export default function Creator() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    link: "",
    ownershipCode: "",
  });
  const [qrUrl, setQrUrl] = useState('');
  const [verificationStatus, setVerificationStatus] = useState('pending');
  const [isLoading, setIsLoading] = useState(false);
  const [channelName, setChannelName] = useState('');

  const getVideoIdFromUrl = (url) => {
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname === 'youtu.be') {
        return urlObj.pathname.slice(1);
      }
      return urlObj.searchParams.get('v');
    } catch {
      return null;
    }
  };

  const handleLinkChange = async (e) => {
    const newLink = e.target.value;
    setFormData({ ...formData, link: newLink });

    const videoId = getVideoIdFromUrl(newLink);
    if (videoId) {
      try {
        const response = await fetch(`/api/get-video-info?videoId=${videoId}`);
        const data = await response.json();
        if (data.channelName) {
          console.log('Channel Name:', data.channelName);
          setChannelName(data.channelName);
        }
      } catch (error) {
        console.error('Error fetching video info:', error);
      }
    }
  };

  const handleNext = async () => {
    if (step === 1) {
      setIsLoading(true);
      try {
        console.log('App ID:', process.env.NEXT_PUBLIC_RECLAIM_APP_ID);
      console.log('App Secret:', process.env.NEXT_PUBLIC_RECLAIM_APP_SECRET);
      console.log('Provider ID:', process.env.NEXT_PUBLIC_RECLAIM_GITHUB_TOTAL_CONTRIBUTIONS_PROVIDER_ID);

      // Validate environment variables
      if (!process.env.NEXT_PUBLIC_RECLAIM_APP_ID) {
        throw new Error('Missing NEXT_PUBLIC_RECLAIM_APP_ID');
      }
      if (!process.env.NEXT_PUBLIC_RECLAIM_APP_SECRET) {
        throw new Error('Missing NEXT_PUBLIC_RECLAIM_APP_SECRET');
      }
      if (!process.env.NEXT_PUBLIC_RECLAIM_GITHUB_TOTAL_CONTRIBUTIONS_PROVIDER_ID) {
        throw new Error('Missing NEXT_PUBLIC_RECLAIM_GITHUB_TOTAL_CONTRIBUTIONS_PROVIDER_ID');
      }

        const reclaimClient = await ReclaimProofRequest.init(
          process.env.NEXT_PUBLIC_RECLAIM_APP_ID,
          process.env.NEXT_PUBLIC_RECLAIM_APP_SECRET,
          process.env.NEXT_PUBLIC_RECLAIM_GITHUB_TOTAL_CONTRIBUTIONS_PROVIDER_ID
        );

        const requestUrl = await reclaimClient.getRequestUrl();
        console.log('Generated QR Code URL:', requestUrl);
        setQrUrl(requestUrl);

        await reclaimClient.startSession({
          onSuccess: (proof) => {
            console.log('✅ Full Verification Proof:', proof);
            setVerificationStatus('success');
            
            try {
              const contextData = JSON.parse(proof.claimData.context);
              const contributions = contextData.extractedParameters.contributions;
           consolelo.log(contributions)
            } catch (parseError) {
              console.error('Error parsing proof data:', parseError);
            }
            
            setStep(3);
          },
          onError: (error) => {
            console.error('❌ Verification failed:', error);
            setVerificationStatus('failed');
          }
        });

        setStep(2);
      } catch (error) {
        console.error('Error in verification process:', error);
        setVerificationStatus('failed');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* New Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 p-4">
        <div className="mb-8">
          <h2 className="text-xl font-bold tracking-tight">Creator Dashboard</h2>
        </div>
        <nav className="space-y-2">
          <a 
            href="#" 
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-900"
          >
            <Plus className="h-5 w-5" />
            <span>Submit New Course</span>
          </a>
          <a 
            href="#" 
            className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-50"
          >
            <Book className="h-5 w-5" />
            <span>My Courses</span>
          </a>
        </nav>
      </div>

      {/* Main Content - Existing Form */}
      <div className="flex-1 p-8">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight mb-2">Submit a Course</h1>
            <p className="text-gray-500">Step {step} of 3</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {step === 1 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="link">Video or Playlist Link</Label>
                    <Input
                      id="link"
                      placeholder="https://your-project.com"
                      value={formData.link}
                      onChange={handleLinkChange}
                    />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="ownership" className="text-lg font-semibold">
                      Verify ownership of {channelName}
                    </Label>
                    <p className="text-sm text-gray-500 mb-4">
                      Please scan the QR code to verify that you own the YouTube channel "{channelName}"
                    </p>
                    <div className="flex justify-center p-4">
                      <QRCode value={qrUrl} size={256} />
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Review Information</p>
                    <p className="text-sm text-gray-500">{formData.link}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Verification Status</p>
                    <p className="text-sm text-gray-500">Verified</p>
                  </div>
                </div>
              )}
            </form>

            <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
              {step > 1 ? (
                <Button variant="outline" onClick={handleBack}>
                  Back
                </Button>
              ) : (
                <div />
              )}
              {step === 1 ? (
                <Button onClick={handleNext} disabled={isLoading}>
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <Loader className="animate-spin h-4 w-4" />
                      <span>Loading...</span>
                    </div>
                  ) : (
                    'Continue'
                  )}
                </Button>
              ) : step === 2 ? (
                <div /> // No button in step 2, waiting for QR verification
              ) : (
                <Button type="submit" onClick={handleSubmit}>
                  Submit
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}