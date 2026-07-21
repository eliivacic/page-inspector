export default function ThankYouPage() {
  return (
    <main className="min-h-screen bg-[#fbfbfa] flex items-center justify-center px-6">

      <div className="max-w-xl rounded-2xl bg-white p-10 text-center shadow">

        <div className="text-5xl">
          🎉
        </div>

        <h1 className="mt-6 text-4xl font-bold text-[#18392b]">
          Your audit is being prepared
        </h1>

        <p className="mt-4 text-lg text-gray-600">
          Thank you for your purchase.
          Your complete PageInspector report will be sent to your email shortly.
        </p>

        <div className="mt-8 rounded-xl bg-[#f1f5f2] p-6">
          <p className="font-semibold">
            Check your inbox
          </p>

          <p className="mt-2 text-sm text-gray-600">
            Your AI-generated audit includes SEO, UX,
            performance, conversion and copywriting recommendations.
          </p>
        </div>

        <p className="mt-8 text-sm text-gray-500">
          Don't forget to check your spam folder.
        </p>

      </div>

    </main>
  );
}