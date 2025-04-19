
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

const HeroSection = () => {
  return (
    <div className="relative h-[600px] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://lovable-uploads.s3.amazonaws.com/7f3fe22b-6695-4f65-a761-cb19edbf7da6.png"
          alt="Pharmacy Care Hero"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black opacity-40"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
        <div className="max-w-2xl text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Your Health Is Our Priority
          </h1>
          <p className="text-lg md:text-xl mb-8 opacity-90">
            Browse our wide range of pharmaceutical products and get them delivered right to your doorstep.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/products">
              <Button className="bg-pharmacy-primary hover:bg-pharmacy-dark text-white px-6 py-3 text-lg">
                Shop Now
                <ChevronRight size={20} className="ml-2" />
              </Button>
            </Link>
            <Link to="/categories">
              <Button variant="outline" className="bg-white/10 text-white border-white hover:bg-white/20 px-6 py-3 text-lg">
                Explore Categories
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
