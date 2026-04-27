import Layout from '../components/layout/Layout';

export default function PrivacyPage() {
  return (
    <Layout>
      <div className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
            <div className="prose prose-blue max-w-none text-gray-600">
              <p className="mb-4">Last updated: April 2026</p>
              
              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">1. Information We Collect</h2>
              <p className="mb-4">When you use AdFlow Pro, we collect the following types of information:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Account information (name, email, password)</li>
                <li>Profile information (phone number, city, business name)</li>
                <li>Ad content and images you provide</li>
                <li>Usage data and platform analytics</li>
              </ul>

              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">2. How We Use Your Information</h2>
              <p className="mb-4">We use the collected information to:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Provide and maintain our services</li>
                <li>Verify your identity and prevent fraud</li>
                <li>Communicate with you regarding your ads and payments</li>
                <li>Improve our platform's user experience</li>
              </ul>

              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">3. Data Sharing</h2>
              <p className="mb-4">We do not sell your personal data to third parties. Public ad information (like your contact phone number) will be visible to other users of the platform as part of the ad display.</p>

              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">4. Data Security</h2>
              <p className="mb-4">We implement industry-standard security measures to protect your personal information and payment details.</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
