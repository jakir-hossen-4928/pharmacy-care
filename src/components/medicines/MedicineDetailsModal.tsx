
import { Medicine } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";

interface MedicineDetailsModalProps {
  medicine: Medicine;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (medicine: Medicine) => void;
}

const MedicineDetailsModal = ({
  medicine,
  isOpen,
  onClose,
  onAddToCart,
}: MedicineDetailsModalProps) => {
  const { name, price, imageUrl, category, stock, discount, description } = medicine;
  const discountedPrice = discount ? price - (price * discount / 100) : price;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{name}</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div className="relative">
            <div className="absolute top-2 left-2 z-10 flex flex-col gap-2">
              {stock > 0 ? (
                <Badge className="bg-green-500 hover:bg-green-600">In Stock</Badge>
              ) : (
                <Badge className="bg-red-500 hover:bg-red-600">Out of Stock</Badge>
              )}
              {discount && discount > 0 && (
                <Badge variant="destructive">{discount}% OFF</Badge>
              )}
            </div>
            <img
              src={imageUrl}
              alt={name}
              className="w-full h-64 object-cover rounded-lg"
            />
          </div>
          
          <div className="space-y-4">
            <div>
              <Badge variant="outline" className="mb-2">
                {category}
              </Badge>
              <p className="text-gray-600">{description}</p>
            </div>
            
            <div className="flex items-center">
              {discount && discount > 0 ? (
                <>
                  <span className="text-2xl font-bold text-pharmacy-primary">
                    {discountedPrice.toFixed(2)} TK
                  </span>
                  <span className="ml-2 text-sm text-gray-500 line-through">
                    {price.toFixed(2)} TK
                  </span>
                </>
              ) : (
                <span className="text-2xl font-bold text-pharmacy-primary">
                  {price.toFixed(2)} TK
                </span>
              )}
            </div>
            
            <Button
              className="w-full bg-pharmacy-primary hover:bg-pharmacy-dark"
              onClick={() => onAddToCart(medicine)}
              disabled={stock <= 0}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add to Cart
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MedicineDetailsModal;
