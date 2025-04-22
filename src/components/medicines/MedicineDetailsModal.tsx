import { Medicine } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Trash2, Loader2, Package } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useCart } from "@/contexts/CartContext";

interface MedicineDetailsModalProps {
  medicine: Medicine;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: () => void;
  orderType: "retail" | "wholesale";
  setOrderType: (type: "retail" | "wholesale") => void;
}

const MedicineDetailsModal = ({
  medicine,
  isOpen,
  onClose,
  onAddToCart,
  orderType,
  setOrderType,
}: MedicineDetailsModalProps) => {
  const { cartItems, operationLoading } = useCart();
  const { name, price, wholesalePrice, minWholesaleQuantity, imageUrl, category, stock, discount, description } = medicine;
  const effectivePrice = orderType === "wholesale" && wholesalePrice ? wholesalePrice : discount && discount > 0 ? price * (1 - discount / 100) : price;
  const isAdding = operationLoading[`add_${medicine.id}_${orderType}`];
  const isRemoving = operationLoading[`remove_${medicine.id}`];
  const isInCart = cartItems.some((item) => item.medicine.id === medicine.id && item.orderType === orderType);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl sm:p-6 animate-in fade-in duration-300">
        <DialogHeader>
          <DialogTitle className="text-2xl sm:text-3xl font-bold text-gray-800">{name}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div className="relative">
            <div className="absolute top-2 left-2 z-10 flex flex-col gap-2">
              {stock > 0 ? (
                <Badge className="bg-green-500 hover:bg-green-600 text-xs font-semibold">In Stock</Badge>
              ) : (
                <Badge className="bg-red-500 hover:bg-red-600 text-xs font-semibold">Out of Stock</Badge>
              )}
              {discount > 0 && (
                <Badge variant="destructive" className="text-xs font-semibold">{discount}% OFF</Badge>
              )}
              {wholesalePrice && (
                <Badge className="bg-blue-500 hover:bg-blue-600 text-xs font-semibold flex items-center">
                  <Package className="h-3 w-3 mr-1" /> Wholesale
                </Badge>
              )}
            </div>
            <img
              src={imageUrl || "/placeholder-medicine.jpg"}
              alt={name}
              className="w-full h-64 object-cover rounded-lg transition-transform duration-300 hover:scale-105"
            />
          </div>

          <div className="space-y-6">
            <div>
              <Badge variant="outline" className="mb-3 text-xs bg-gray-100">{category}</Badge>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">{description || "No description available."}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <span className="text-2xl sm:text-3xl font-bold text-pharmacy-primary">
                  {effectivePrice.toFixed(2)} TK
                </span>
                {discount > 0 && orderType === "retail" && (
                  <span className="text-base text-gray-500 line-through">
                    {price.toFixed(2)} TK
                  </span>
                )}
              </div>
              {wholesalePrice && (
                <p className="text-sm text-gray-600">
                  Wholesale: {wholesalePrice.toFixed(2)} TK (Min: {minWholesaleQuantity} units)
                </p>
              )}
            </div>

            {wholesalePrice && (
              <div>
                <RadioGroup
                  value={orderType}
                  onValueChange={(value: "retail" | "wholesale") => setOrderType(value)}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="retail" id={`retail_modal_${medicine.id}`} />
                    <Label htmlFor={`retail_modal_${medicine.id}`} className="text-sm">Retail</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="wholesale" id={`wholesale_modal_${medicine.id}`} />
                    <Label htmlFor={`wholesale_modal_${medicine.id}`} className="text-sm">Wholesale</Label>
                  </div>
                </RadioGroup>
              </div>
            )}

            <Button
              className={`w-full text-base font-medium transition-colors duration-200 ${
                isInCart ? "bg-green-500 hover:bg-green-600" : "bg-pharmacy-primary hover:bg-pharmacy-dark"
              }`}
              onClick={onAddToCart}
              disabled={stock <= 0 || isAdding || isRemoving}
              aria-label={isInCart ? `Remove ${name} from cart` : `Add ${name} to cart as ${orderType}`}
            >
              {isAdding ? (
                <Loader2 className="animate-spin h-4 w-4" />
              ) : isRemoving ? (
                <Loader2 className="animate-spin h-4 w-4" />
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
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MedicineDetailsModal;