import Layout from '../components/layout/Layout';

export default function TermsPage() {
  return (
    <Layout>
      <div className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms of Service</h1>
            <div className="prose prose-blue max-w-none text-gray-600">
              <p className="mb-4">Last updated: April 2026</p>
              
              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">1. Acceptance of Terms</h2>
              <p className="mb-4">By accessing or using AdFlow Pro, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform.</p>

              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">2. User Accounts</h2>
              <p className="mb-4">To post ads, you must create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>

              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">3. Content Guidelines</h2>
              <p className="mb-4">All ads must comply with our content policy. We do not allow:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Illegal or fraudulent items</li>
                <li>Hate speech or offensive content</li>
                <li>Fake or misleading listings</li>
                <li>Counterfeit goods</li>
              </ul>

              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">4. Payment and Packages</h2>
              <p className="mb-4">Payments for ad packages are non-refundable once the ad has been approved and published. If your ad is rejected during moderation, you may be eligible for a refund or a free revision.</p>

              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">5. Moderation</h2>
              <p className="mb-4">We reserve the right to review, reject, or remove any content that violates our policies without prior notice.</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
