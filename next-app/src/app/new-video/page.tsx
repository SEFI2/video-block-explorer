'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import VideoGenerationForm from '@/components/videos/VideoGenerationForm';

export default function NewVideoPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const handleSuccess = (videoId: string) => {
    setIsSubmitting(false);
    setFormMessage({
      type: 'success',
      message: 'Video request submitted successfully!'
    });
    
    // Redirect after a short delay
    setTimeout(() => {
      router.push(`/video/${videoId}`);
    }, 2000);
  };

  const handleError = (message: string) => {
    setIsSubmitting(false);
    setFormMessage({
      type: 'error',
      message
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <h1 className="text-3xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
        Create New Video
      </h1>

      {formMessage && (
        <div 
          className={`p-4 mb-6 rounded-md ${
            formMessage.type === 'success' ? 'bg-green-100 border border-green-400 text-green-700' : 
            'bg-red-100 border border-red-400 text-red-700'
          }`}
        >
          {formMessage.message}
        </div>
      )}

      <div className="card-dark p-6 max-w-2xl mx-auto">
        <VideoGenerationForm 
          onSubmitStart={() => setIsSubmitting(true)}
          onSubmitSuccess={handleSuccess}
          onSubmitError={handleError}
          isSubmitting={isSubmitting}
        />
      </div>

      <div className="mt-8 p-6 card-dark max-w-2xl mx-auto">
        <h2 className="text-xl font-semibold mb-4 text-blue-400">How it works</h2>
        <ol className="list-decimal pl-6 space-y-3 text-gray-300">
          <li>Fill out the form with your desired video parameters</li>
          <li>Connect your wallet if you haven&apos;t already</li>
          <li>Submit your request and approve the transaction</li>
          <li>You&apos;ll be notified when your video is ready to view</li>
        </ol>
      </div>
    </div>
  );
} 