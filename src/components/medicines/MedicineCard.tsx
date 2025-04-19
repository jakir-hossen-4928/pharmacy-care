
import { Link } from "react-router-dom";
import { Medicine } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface MedicineCardProps {
  medicine: Medicine;
  onAddToCart: (medicine: Medicine) => void;
}

const MedicineCard = ({ medicine, onAddToCart }: MedicineCardProps) => {
  const { id, name, price, imageUrl, category, stock, discount } = medicine;
  
  const discountedPrice = discount ? price - (price * discount / 100) : price;
  
  return (
    <Card className="h-full overflow-hidden transition-all duration-200 hover:shadow-md group">
      <div className="relative">
        {/* Stock Badge */}
        {stock > 0 ? (
          <Badge className="absolute top-2 left-2 z-10 bg-green-500 hover:bg-green-600">
            In Stock
          </Badge>
        ) : (
          <Badge className="absolute top-2 left-2 z-10 bg-red-500 hover:bg-red-600">
            Out of Stock
          </Badge>
        )}
        
        {/* Discount Badge */}
        {discount && discount > 0 && (
          <Badge variant="destructive" className="absolute top-2 right-2 z-10">
            {discount}% OFF
          </Badge>
        )}

        {/* Image */}
        <div className="h-48 overflow-hidden bg-gray-100">
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      </div>

      <CardContent className="p-4">
        {/* Category */}
        <div className="mb-1">
          <Badge variant="outline" className="text-xs">
            {category}
          </Badge>
        </div>
        
        {/* Name */}
        <h3 className="font-medium text-lg mb-2 line-clamp-2 h-14">{name}</h3>
        
        {/* Price */}
        <div className="flex items-center mb-4">
          {discount && discount > 0 ? (
            <>
              <span className="text-lg font-bold text-pharmacy-primary">
                {discountedPrice.toFixed(2)} TK
              </span>
              <span className="ml-2 text-sm text-gray-500 line-through">
                {price.toFixed(2)} TK
              </span>
            </>
          ) : (
            <span className="text-lg font-bold text-pharmacy-primary">
              {price.toFixed(2)} TK
            </span>
          )}
        </div>
        
        {/* Actions */}
        <div className="flex space-x-2">
          <Button
            className="flex-1 bg-pharmacy-primary hover:bg-pharmacy-dark"
            onClick={() => onAddToCart(medicine)}
            disabled={stock <= 0}
          >
            <ShoppingCart size={16} className="mr-2" />
            Add to Cart
          </Button>
          
          <Link to={`/medicine/${id}`} className="flex-none">
            <Button variant="outline" size="icon">
              <Eye size={16} />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default MedicineCard;
