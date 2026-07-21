export default function TestEmailPage() {
  return (
    <div className="min-h-screen bg-[#f7f7f5] p-8">

      <div className="mx-auto max-w-3xl rounded-2xl bg-white shadow">

        <div className="bg-[#18392b] p-8 text-white rounded-t-2xl">
          <h1 className="text-3xl font-bold">
            PageInspector
          </h1>

          <p className="mt-2 text-[#d8e5dd]">
            Website Audit Report
          </p>
        </div>


        <div className="p-8">

          <div className="rounded-xl bg-[#f1f5f2] p-6">
            <p className="text-sm text-gray-500">
              Overall Score
            </p>

            <p className="mt-2 text-5xl font-bold text-[#18392b]">
              82/100
            </p>
          </div>


          <h2 className="mt-8 text-xl font-bold">
            Executive Summary
          </h2>

          <p className="mt-3 text-gray-600">
            Your website has strong potential but needs improvements
            in SEO, user experience and conversion strategy.
          </p>


          <h2 className="mt-8 text-xl font-bold">
            SEO Analysis
          </h2>

          <div className="mt-3 rounded-lg bg-[#f7f7f5] p-4">
            Missing keyword optimization and weak metadata.
          </div>


          <h2 className="mt-8 text-xl font-bold">
            Priority Actions
          </h2>

          <div className="mt-3 rounded-lg bg-[#f7f7f5] p-4">
            Improve homepage messaging and strengthen CTA buttons.
          </div>


        </div>

      </div>

    </div>
  );
}