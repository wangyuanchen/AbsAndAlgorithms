import { protectServer } from "@/features/auth/utils";

export default async function AboutPage() {
  await protectServer();

  return (
    <div className="container max-w-4xl py-8 space-y-8">
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 border-2 border-green-200">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">🏋️</span>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            About FitMenu AI
          </h1>
        </div>
        <p className="text-lg text-green-700 leading-relaxed">
          Your personal AI-powered nutrition assistant for achieving fitness and weight loss goals.
        </p>
      </div>

      <div className="prose prose-green max-w-none space-y-6">
        <section className="bg-white p-6 rounded-xl border border-green-200">
          <h2 className="text-2xl font-bold text-green-800 mb-4">🎯 Our Mission</h2>
          <p className="text-gray-700 leading-relaxed">
            FitMenu AI is dedicated to making personalized nutrition planning accessible to everyone. 
            We leverage cutting-edge artificial intelligence to create customized meal plans that align 
            with your fitness goals, dietary preferences, and nutritional needs.
          </p>
        </section>

        <section className="bg-white p-6 rounded-xl border border-green-200">
          <h2 className="text-2xl font-bold text-green-800 mb-4">💪 What We Offer</h2>
          <div className="space-y-4 text-gray-700">
            <div className="flex gap-3">
              <span className="text-2xl">🥗</span>
              <div>
                <h3 className="font-semibold text-green-700">AI-Generated Meal Plans</h3>
                <p>Personalized nutrition plans based on your specific macros and preferences</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl">📊</span>
              <div>
                <h3 className="font-semibold text-green-700">Macro Tracking</h3>
                <p>Precise protein, carbs, and fat calculations for optimal results</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl">🎯</span>
              <div>
                <h3 className="font-semibold text-green-700">Goal-Oriented</h3>
                <p>Whether you&apos;re bulking, cutting, or maintaining, we&apos;ve got you covered</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl">🍎</span>
              <div>
                <h3 className="font-semibold text-green-700">Healthy & Delicious</h3>
                <p>Nutritious recipes that don&apos;t compromise on taste</p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white p-6 rounded-xl border border-green-200">
          <h2 className="text-2xl font-bold text-green-800 mb-4">🔬 How It Works</h2>
          <ol className="list-decimal list-inside space-y-3 text-gray-700">
            <li className="leading-relaxed">
              <strong>Input Your Goals:</strong> Tell us your target macros, dietary preferences, and restrictions
            </li>
            <li className="leading-relaxed">
              <strong>AI Processing:</strong> Our advanced AI analyzes your requirements and generates optimal meal plans
            </li>
            <li className="leading-relaxed">
              <strong>Get Your Menu:</strong> Receive detailed recipes with exact nutritional breakdown
            </li>
            <li className="leading-relaxed">
              <strong>Track Progress:</strong> Save and manage your favorite meal plans
            </li>
          </ol>
        </section>

        <section className="bg-white p-6 rounded-xl border border-green-200">
          <h2 className="text-2xl font-bold text-green-800 mb-4">🌟 Why Choose FitMenu AI</h2>
          <ul className="space-y-2 text-gray-700">
            <li>✅ Powered by advanced AI technology (Azure OpenAI)</li>
            <li>✅ Personalized to your unique nutritional needs</li>
            <li>✅ Science-based macro calculations</li>
            <li>✅ Easy-to-follow recipes and meal plans</li>
            <li>✅ Supports various dietary preferences and restrictions</li>
            <li>✅ Constantly updated with new recipes and features</li>
          </ul>
        </section>

        <section className="bg-gradient-to-r from-green-100 to-emerald-100 p-6 rounded-xl border-2 border-green-300">
          <h2 className="text-2xl font-bold text-green-800 mb-3">📧 Contact Us</h2>
          <p className="text-gray-700 mb-4">
            Have questions or suggestions? We&apos;d love to hear from you!
          </p>
          <p className="text-green-700 font-medium">
            Email: <a href="mailto:pgr.sen@gmail.com" className="underline hover:text-green-600">pgr.sen@gmail.com</a>
          </p>
        </section>
      </div>
    </div>
  );
}
