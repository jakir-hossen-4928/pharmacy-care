import React from 'react';
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css"; // Required CSS

const ImageSlider = () => {
  const images = [
    'https://images.unsplash.com/photo-1576602976047-174e57a47881?ixlib=rb-4.0.3&auto=format&fit=crop&w=1169&q=80',
    'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1169&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1169&q=80',
  ];

  return (
    <div className="w-full overflow-hidden">
      <Carousel
        showArrows={true}
        showThumbs={false}
        infiniteLoop={true}
        autoPlay={true}
        interval={3000}
        swipeable={true}
        emulateTouch={true}
        showStatus={false}
        dynamicHeight={false}
        className="relative"
      >
        {images.map((image, index) => (
          <div key={index} className="w-full">
            <img
              src={image}
              alt={`Slide ${index + 1}`}
              className="w-full h-[150px] lg:h-[300px] object-cover"
            />
          </div>
        ))}
      </Carousel>
    </div>
  );
};

export default ImageSlider;