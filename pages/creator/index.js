import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ReclaimProofRequest } from '@reclaimprotocol/js-sdk';
import QRCode from "react-qr-code";
import { Loader } from "lucide-react";

export default function Creator() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    link: "",
    ownershipCode: "",
  });
  const [qrUrl, setQrUrl] = useState('');
  const [verificationStatus, setVerificationStatus] = useState('pending');
  const [isLoading, setIsLoading] = useState(false);

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-xl p-6">
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
                    onChange={(e) =>
                      setFormData({ ...formData, link: e.target.value })
                    }
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ownership">Scan QR Code to Verify</Label>
                  <div className="flex justify-center p-4">
                    <QRCode value={qrUrl} size={256} />
                  </div>
                  <p className="text-xs text-gray-500 text-center">
                    Please scan the QR code to complete verification
                  </p>
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
  );
}