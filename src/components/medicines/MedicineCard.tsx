import { useState, memo } from "react";
import { Medicine } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Eye, Trash2, Loader2, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import MedicineDetailsModal from "./MedicineDetailsModal";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

interface MedicineCardProps {
  medicine: Medicine;
}

const MedicineCard = ({ medicine }: MedicineCardProps) => {
  const [showModal, setShowModal] = useState(false);
  const [orderType, setOrderType] = useState<"retail" | "wholesale">("retail");
  const { cartItems, addToCart, removeFromCart, operationLoading } = useCart();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const { id, name, price, wholesalePrice, minWholesaleQuantity, imageUrl, category, stock, discount } = medicine;

  const effectivePrice =
    orderType === "wholesale" && wholesalePrice != null
      ? wholesalePrice
      : discount && discount > 0
      ? price * (1 - discount / 100)
      : price;
  const isAdding = operationLoading[`add_${id}_${orderType}`];
  const isRemoving = operationLoading[`remove_${id}`];
  const isProcessing = isAdding || isRemoving; // Combined loading state
  const isInCart = cartItems.some((item) => item.medicine.id === id && item.orderType === orderType);
  const cartItem = cartItems.find((item) => item.medicine.id === id && item.orderType === orderType);
  const isWholesaleAvailable = wholesalePrice != null && minWholesaleQuantity != null;

  const handleAddToCart = async () => {
    if (!currentUser) {
      toast({
        title: "Login Required",
        description: "Please log in to add items to your cart.",
        variant: "destructive",
      });
      return;
    }

    if (isInCart && cartItem) {
      try {
        await removeFromCart(cartItem.id);
        toast({
          title: "Removed from Cart",
          description: `${name} has been removed from your cart.`,
          variant: "default",
        });
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to remove item from cart.",
          variant: "destructive",
        });
      }
    } else {
      try {
        const quantity = orderType === "wholesale" && minWholesaleQuantity != null ? minWholesaleQuantity : 1;
        await addToCart(medicine, quantity, orderType);
        toast({
          title: "Success",
          description: `Awesome! ${name} added to your cart as ${orderType}!`,
          variant: "default",
        });
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to add item to cart.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <>
      <Card className="h-full overflow-hidden transition-transform duration-300 group hover:scale-105 hover:shadow-lg">
        <div className="relative">
          <div className="absolute top-2 left-2 z-10 flex flex-col gap-2">
            {stock > 0 ? (
              <Badge className="bg-green-500 hover:bg-green-600 text-xs font-semibold">In Stock</Badge>
            ) : (
              <Badge className="bg-red-500 hover:bg-red-600 text-xs font-semibold">Out of Stock</Badge>
            )}
            {discount > 0 && (
              <Badge variant="destructive" className="text-xs font-semibold">
                {discount}% OFF
              </Badge>
            )}
            {isWholesaleAvailable && (
              <Badge className="bg-blue-500 hover:bg-blue-600 text-xs font-semibold flex items-center">
                <Package className="h-3 w-3 mr-1" /> Wholesale
              </Badge>
            )}
          </div>

          <div className="h-48 sm:h-64 bg-gray-100 flex items-center justify-center">
            <img
              src={imageUrl || "/placeholder-medicine.jpg"}
              alt={name}
              className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110"
            />
          </div>
        </div>

        <CardContent className="p-3 sm:p-4">
          <div className="mb-2">
            <Badge variant="outline" className="text-xs bg-gray-100">{category}</Badge>
          </div>

          <h3 className="font-semibold text-base sm:text-lg mb-2 line-clamp-2 min-h-[2.5rem]">{name}</h3>

          <div className="mb-4 space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-lg sm:text-xl font-bold text-pharmacy-primary">
                {effectivePrice.toFixed(2)} TK
              </span>
              {discount > 0 && orderType === "retail" && (
                <span className="text-sm text-gray-500 line-through">
                  {price.toFixed(2)} TK
                </span>
              )}
            </div>
            {isWholesaleAvailable && (
              <p className="text-xs text-gray-600">
                Wholesale: {wholesalePrice.toFixed(2)} TK (Min: {minWholesaleQuantity} units)
              </p>
            )}
          </div>

          {isWholesaleAvailable && (
            <div className="mb-4">
              <RadioGroup
                value={orderType}
                onValueChange={(value: "retail" | "wholesale") => setOrderType(value)}
                className="flex space-x-4"
                disabled={isProcessing} // Disable radio group during operations
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="retail" id={`retail_${id}`} disabled={isProcessing} />
                  <Label htmlFor={`retail_${id}`} className="text-sm">
                    Retail
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="wholesale" id={`wholesale_${id}`} disabled={isProcessing} />
                  <Label htmlFor={`wholesale_${id}`} className="text-sm">
                    Wholesale
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              className={`w-full text-sm font-medium transition-colors duration-200 ${
                isInCart
                  ? "bg-green-500 hover:bg-green-600"
                  : "bg-pharmacy-primary hover:bg-pharmacy-dark"
              }`}
              onClick={handleAddToCart}
              disabled={stock <= 0 || isProcessing} // Disable during any operation
              aria-label={isInCart ? `Remove ${name} from cart` : `Add ${name} to cart as ${orderType}`}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  Processing...
                </>
              ) : isInCart ? (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Already in Cart
                </>
              ) : (
                <>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Add to Cart
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="w-full sm:w-10 border-gray-300 hover:bg-gray-100 transition-colors"
              onClick={() => setShowModal(true)}
              disabled={isProcessing} // Disable during any operation
              aria-label={`View details of ${name}`}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <MedicineDetailsModal
        medicine={medicine}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onAddToCart={handleAddToCart}
        orderType={orderType}
        setOrderType={setOrderType}
      />
    </>
  );
};

export default memo(MedicineCard);