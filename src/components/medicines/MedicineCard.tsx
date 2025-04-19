import { useState } from "react";
import { Medicine } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import MedicineDetailsModal from "./MedicineDetailsModal";

interface MedicineCardProps {
  medicine: Medicine;
  onAddToCart: (medicine: Medicine) => void;
}

const MedicineCard = ({ medicine, onAddToCart }: MedicineCardProps) => {
  const [showModal, setShowModal] = useState(false);
  const { id, name, price, imageUrl, category, stock, discount } = medicine;
  
  const discountedPrice = discount ? price - (price * discount / 100) : price;
  
  return (
    <>
      <Card className="h-full overflow-hidden transition-all duration-200 hover:shadow-md group">
        <div className="relative">
          <div className="absolute top-2 left-2 z-10 flex flex-col gap-2">
            {stock > 0 ? (
              <Badge className="bg-green-500 hover:bg-green-600">
                In Stock
              </Badge>
            ) : (
              <Badge className="bg-red-500 hover:bg-red-600">
                Out of Stock
              </Badge>
            )}
            {discount && discount > 0 && (
              <Badge variant="destructive">
                {discount}% OFF
              </Badge>
            )}
          </div>

          <div className="h-40 sm:h-48 overflow-hidden bg-gray-100">
            <img
              src={imageUrl}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>

        <CardContent className="p-3 sm:p-4">
          <div className="mb-1">
            <Badge variant="outline" className="text-xs">
              {category}
            </Badge>
          </div>
          
          <h3 className="font-medium text-base sm:text-lg mb-2 line-clamp-2 min-h-[2.5rem]">{name}</h3>
          
          <div className="flex items-center mb-3 sm:mb-4">
            {discount && discount > 0 ? (
              <>
                <span className="text-base sm:text-lg font-bold text-pharmacy-primary">
                  {discountedPrice.toFixed(2)} TK
                </span>
                <span className="ml-2 text-xs sm:text-sm text-gray-500 line-through">
                  {price.toFixed(2)} TK
                </span>
              </>
            ) : (
              <span className="text-base sm:text-lg font-bold text-pharmacy-primary">
                {price.toFixed(2)} TK
              </span>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              className="w-full bg-pharmacy-primary hover:bg-pharmacy-dark text-sm"
              onClick={() => onAddToCart(medicine)}
              disabled={stock <= 0}
            >
              <ShoppingCart size={16} className="mr-2" />
              Add to Cart
            </Button>
            
            <Button 
              variant="outline" 
              size="icon" 
              className="w-full sm:w-10"
              onClick={() => setShowModal(true)}
            >
              <Eye size={16} />
            </Button>
          </div>
        </CardContent>
      </Card>

      <MedicineDetailsModal
        medicine={medicine}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onAddToCart={onAddToCart}
      />
    </>
  );
};

export default MedicineCard;
