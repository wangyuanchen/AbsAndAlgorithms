import { protectServer } from "@/features/auth/utils";

export default async function PrivacyPage() {
  await protectServer();

  return (
    <div className="container max-w-4xl py-8 space-y-6">
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 border-2 border-green-200">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
          Privacy Policy
        </h1>
        <p className="text-green-700">Last updated: November 20, 2025</p>
      </div>

      <div className="bg-white p-8 rounded-xl border border-green-200 prose prose-green max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-green-800 mb-4">1. Information We Collect</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            FitMenu AI collects and processes the following information to provide our AI-powered nutrition planning service:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Account information: email address and password (encrypted)</li>
            <li>Nutritional preferences and dietary requirements you provide</li>
            <li>Generated meal plans and saved menus</li>
            <li>Usage data to improve our AI recommendations</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-green-800 mb-4">2. How We Use Your Information</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            We use your information for the following purposes:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>To generate personalized AI meal plans based on your preferences</li>
            <li>To save and manage your custom nutrition plans</li>
            <li>To improve our AI algorithms and service quality</li>
            <li>To communicate important updates about our service</li>
            <li>To ensure account security and prevent unauthorized access</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-green-800 mb-4">3. Data Storage and Security</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Your data security is our priority:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>All passwords are encrypted using industry-standard bcrypt hashing</li>
            <li>Data is stored on secure PostgreSQL databases with SSL encryption</li>
            <li>We implement regular security updates and monitoring</li>
            <li>Access to your data is strictly limited to necessary operations</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-green-800 mb-4">4. Third-Party Services</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            We use the following third-party services:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li><strong>Azure OpenAI:</strong> For AI-powered meal plan generation</li>
            <li><strong>Google AdSense:</strong> For displaying relevant advertisements</li>
            <li><strong>Vercel:</strong> For hosting and content delivery</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mt-4">
            These services have their own privacy policies and may collect additional data as described in their respective policies.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-green-800 mb-4">5. Cookies and Tracking</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            We use cookies and similar technologies for:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Authentication and session management</li>
            <li>Remembering your preferences and settings</li>
            <li>Analytics to understand how users interact with our service</li>
            <li>AdSense advertising (managed by Google)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-green-800 mb-4">6. Your Rights</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            You have the right to:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Access your personal data at any time</li>
            <li>Request deletion of your account and associated data</li>
            <li>Modify your dietary preferences and saved menus</li>
            <li>Opt-out of non-essential communications</li>
            <li>Export your saved meal plans</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-green-800 mb-4">7. Data Retention</h2>
          <p className="text-gray-700 leading-relaxed">
            We retain your data as long as your account is active. If you delete your account, 
            we will permanently remove your personal information within 30 days, except where 
            required by law to retain certain data.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-green-800 mb-4">8. Children&apos;s Privacy</h2>
          <p className="text-gray-700 leading-relaxed">
            FitMenu AI is not intended for users under 13 years of age. We do not knowingly 
            collect personal information from children under 13. If you believe we have 
            inadvertently collected such information, please contact us immediately.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-green-800 mb-4">9. Changes to Privacy Policy</h2>
          <p className="text-gray-700 leading-relaxed">
            We may update this privacy policy from time to time. We will notify you of any 
            material changes by updating the &quot;Last updated&quot; date at the top of this policy 
            and, where appropriate, through email notification.
          </p>
        </section>

        <section className="bg-green-50 p-6 rounded-lg border-2 border-green-200">
          <h2 className="text-2xl font-bold text-green-800 mb-4">10. Contact Us</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            If you have any questions about this Privacy Policy or how we handle your data, please contact us:
          </p>
          <p className="text-green-700 font-medium">
            Email: <a href="mailto:privacy@fitmenu-ai.com" className="underline hover:text-green-600">privacy@fitmenu-ai.com</a>
          </p>
        </section>
      </div>
    </div>
  );
}
