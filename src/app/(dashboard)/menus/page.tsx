import { MenuGenerator } from "@/features/menus/components/menu-generator";
import { AdSenseAd } from "@/components/adsense-ad";

export default function MenusPage() {
  return (
    <div className="container py-8 space-y-6">
      {/* AdSense Ad - Top */}
      <AdSenseAd 
        adSlot="4240966673" 
        adFormat="horizontal"
        className="mb-6"
      />
      
      <MenuGenerator />
      
      {/* AdSense Ad - Bottom */}
      <AdSenseAd 
        adSlot="8688188589" 
        adFormat="auto"
        className="mt-6"
      />
    </div>
  );
}