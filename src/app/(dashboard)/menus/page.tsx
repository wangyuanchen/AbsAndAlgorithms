import { MenuGenerator } from "@/features/menus/components/menu-generator";
import { AdSenseAd } from "@/components/adsense-ad";

export default function MenusPage() {
  return (
    <div className="container py-8 space-y-6">
      {/* AdSense Ad - Top */}
      <AdSenseAd 
        adSlot="YOUR_AD_SLOT_ID_3" 
        adFormat="horizontal"
        className="mb-6"
      />
      
      <MenuGenerator />
      
      {/* AdSense Ad - Bottom */}
      <AdSenseAd 
        adSlot="YOUR_AD_SLOT_ID_4" 
        adFormat="auto"
        className="mt-6"
      />
    </div>
  );
}