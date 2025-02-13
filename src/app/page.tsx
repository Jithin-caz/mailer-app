// app/page.tsx
'use client';

import { useState } from 'react';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: null, message: '' });

    // const formData = new FormData(e.currentTarget);
    // const data = {
    //   to: formData.get('to'),
    //   subject: formData.get('subject'),
    //   message: formData.get('message'),
    // };

    try {
      const response = await fetch('/api/sendMail', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();
      console.log(result)
      if (response.ok) {
        setStatus({
          type: 'success',
          message: 'Email sent successfully!',
        });
        (e.target as HTMLFormElement).reset();
        alert("mail sending completed")
      } else {
        alert("mail sending failed")
        throw new Error(result.error || 'Failed to send email');
      }
    } catch (error) {
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'An error occurred',
      });
      alert("mail sending failed")
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">Send Email</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* <div>
            <label htmlFor="to" className="block mb-1">
              To:
            </label>
            <input
              type="email"
              id="to"
              name="to"
              required
              className="w-full p-2 border rounded"
            />
          </div> */}

          {/* <div>
            <label htmlFor="subject" className="block mb-1">
              Subject:
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              required
              className="w-full p-2 border rounded"
            />
          </div> */}

          {/* <div>
            <label htmlFor="message" className="block mb-1">
              Message:
            </label>
            <textarea
              id="message"
              name="message"
              required
              rows={5}
              className="w-full p-2 border rounded"
            />
          </div> */}

          <button
            type="submit"
            disabled={loading}
            className={`w-full p-2 text-white rounded ${
              loading
                ? 'bg-gray-400'
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {loading ? 'Sending...' : 'Send Email'}
          </button>
          <img src="/pic.jpeg" alt="" />
        </form>

        {status.type && (
          <div
            className={`mt-4 p-3 rounded ${
              status.type === 'success'
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {status.message}
          </div>
        )}
      </div>
    </main>
  );
}
