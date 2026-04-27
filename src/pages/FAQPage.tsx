import Layout from '../components/layout/Layout';

export default function FAQPage() {
  const faqs = [
    { q: "How do I post an ad?", a: "To post an ad, sign up for an account, go to your Dashboard, and click 'Post New Ad'. Fill in the details and submit it for review." },
    { q: "How long does it take for my ad to be approved?", a: "Ads are usually reviewed by our moderation team within 24 hours. Once approved and payment is verified, your ad will go live." },
    { q: "What payment methods are supported?", a: "We currently support Bank Transfer, Easypaisa, and JazzCash. You'll need to upload the transaction reference after transferring the amount." },
    { q: "Can I edit my ad after publishing?", a: "Yes, you can edit your ad from the dashboard. However, major changes may require a re-review by our moderation team." },
    { q: "How do featured ads work?", a: "Premium packages give you featured status. Featured ads appear at the top of category and explore pages, getting up to 5x more views." },
  ];

  return (
    <Layout>
      <div className="bg-gray-50 py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Frequently Asked Questions</h1>
            <p className="text-lg text-gray-600">Have questions? We're here to help.</p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-gray-600 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center bg-blue-50 rounded-2xl p-8 border border-blue-100">
            <h3 className="text-xl font-bold text-blue-900 mb-2">Still need help?</h3>
            <p className="text-blue-700 mb-6">Our support team is available 24/7 to assist you.</p>
            <a href="/contact" className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition shadow-sm">
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
}
