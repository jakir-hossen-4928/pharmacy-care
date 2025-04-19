
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <div className="relative overflow-hidden bg-white">
      <div className="mx-auto max-w-7xl">
        <div className="relative z-10 lg:w-full lg:max-w-2xl">
          <div className="relative px-6 py-16 sm:py-24 lg:px-8 lg:py-32">
            <div className="mx-auto max-w-2xl lg:mx-0">
              <div className="hidden sm:mb-8 sm:flex sm:justify-start">
                <div className="relative rounded-full px-3 py-1 text-sm leading-6 text-gray-600 ring-1 ring-gray-900/10 hover:ring-gray-900/20">
                  Introducing our new collection.{' '}
                  <Link to="/categories/new" className="font-semibold text-pharmacy-primary">
                    <span className="absolute inset-0" aria-hidden="true" />
                    Read more <span aria-hidden="true">&rarr;</span>
                  </Link>
                </div>
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                Your Health, Our Priority
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                Discover our wide range of homeopathic medicines, expertly curated to support your wellbeing. Quality products, trusted service, and professional guidance.
              </p>
              <div className="mt-10 flex items-center gap-x-6">
                <Button asChild className="bg-pharmacy-primary hover:bg-pharmacy-dark">
                  <Link to="/categories/all">
                    Browse Products
                  </Link>
                </Button>
                <Link to="/about" className="text-sm font-semibold leading-6 text-gray-900">
                  Learn More <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
        <img
          className="aspect-[3/2] object-cover lg:aspect-auto lg:h-full lg:w-full"
          src="https://images.unsplash.com/photo-1576602976047-174e57a47881?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1169&q=80"
          alt="Homeopathic Medicine"
        />
      </div>
    </div>
  );
};

export default Hero;
