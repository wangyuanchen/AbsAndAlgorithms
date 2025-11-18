import { protectServer } from "@/features/auth/utils";

import { MenusSection } from "./menus-section";

export default async function Home() {
  await protectServer();

  return (
    <div className="flex flex-col space-y-6 max-w-screen-xl mx-auto pb-10">
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 border-2 border-green-200 shadow-lg">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-5xl">🏋️</span>
            <span className="text-5xl">🥗</span>
            <span className="text-5xl">💪</span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            FitMenu AI Generator
          </h1>
          <p className="text-2xl text-green-700 font-medium">
            Generate personalized fitness and weight loss nutrition plans with AI
          </p>
          <div className="flex gap-4 pt-2">
            <div className="bg-white px-4 py-2 rounded-lg border border-green-300">
              <p className="text-sm text-green-600 font-semibold">🎯 Custom Macros</p>
            </div>
            <div className="bg-white px-4 py-2 rounded-lg border border-green-300">
              <p className="text-sm text-green-600 font-semibold">📊 Calorie Tracking</p>
            </div>
            <div className="bg-white px-4 py-2 rounded-lg border border-green-300">
              <p className="text-sm text-green-600 font-semibold">🥑 Healthy Recipes</p>
            </div>
          </div>
        </div>
      </div>
      <MenusSection />
    </div>
  );
};