import { Button } from "@/components/ui/button";
import { useUIStore } from "@/lib/store";

export default function Hero() {
  const { openLocationSelector } = useUIStore();
  
  return (
    <section className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/40 z-10"></div>
      <div className="h-[40vh] md:h-[50vh] relative overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1626612347480-ee41f555e182?q=80&w=1470&auto=format&fit=crop" 
          alt="Authentic Assamese Cuisine" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="container relative z-20 h-full flex flex-col justify-center items-start text-white">
          <h1 className="text-3xl md:text-5xl font-bold max-w-md md:max-w-2xl">Authentic Assamese Cuisine at Your Doorstep</h1>
          <p className="mt-2 md:mt-4 text-lg md:text-xl max-w-md md:max-w-2xl">Experience the unique flavors of Assam delivered fresh to your home</p>
          <Button 
            className="mt-4 md:mt-6 bg-white text-black hover:bg-white/90" 
            onClick={openLocationSelector}
          >
            Order Now
          </Button>
        </div>
      </div>
    </section>
  );
}
