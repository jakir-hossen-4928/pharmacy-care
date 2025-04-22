import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useNavigate } from "react-router-dom";
import { getUserProfile } from "@/services/userProfieService";
import { createOrder } from "@/services/userOrderService";
import { clearCart } from "@/services/cartService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Address, User } from "@/lib/types";
import { Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const Checkout = () => {
  const { currentUser } = useAuth();
  const { cartItems, cartCount, totalPrice, deliveryCharge: contextDeliveryCharge, clearCart: clearCartContext } = useCart();
  const navigate = useNavigate();

  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [deliveryCharge, setDeliveryCharge] = useState<number>(contextDeliveryCharge);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchingProfile, setFetchingProfile] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!currentUser) {
        setFetchingProfile(false);
        navigate("/login");
        return;
      }
      try {
        setFetchingProfile(true);
        const profile = await getUserProfile(currentUser.uid);
        setUserProfile(profile);
        if (profile?.addresses && profile.addresses.length > 0) {
          const defaultAddress = profile.addresses.find((addr) => addr.isDefault) || profile.addresses[0];
          setSelectedAddressId(defaultAddress.id);
          updateDeliveryCharge(defaultAddress);
        }
      } catch (err) {
        setError("Failed to load user profile.");
        toast({
          title: "Error",
          description: "Failed to load user profile.",
          variant: "destructive",
        });
      } finally {
        setFetchingProfile(false);
      }
    };
    fetchUserProfile();
  }, [currentUser, navigate]);

  const updateDeliveryCharge = (address: Address) => {
    if (cartItems.every((item) => item.orderType === "wholesale")) {
      setDeliveryCharge(0);
    } else {
      setDeliveryCharge(address.division.toLowerCase() === "dhaka" ? 80 : 120);
    }
  };

  const handleAddressChange = (addressId: string) => {
    setSelectedAddressId(addressId);
    const selectedAddress = userProfile?.addresses?.find((addr) => addr.id === addressId);
    if (selectedAddress) {
      updateDeliveryCharge(selectedAddress);
    }
  };

  const handlePlaceOrder = async () => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    if (!selectedAddressId) {
      setError("Please select a shipping address or add a new one.");
      toast({
        title: "Error",
        description: "Please select a shipping address.",
        variant: "destructive",
      });
      return;
    }

    const selectedAddress = userProfile?.addresses?.find((addr) => addr.id === selectedAddressId);
    if (!selectedAddress) {
      setError("Selected address not found.");
      toast({
        title: "Error",
        description: "Selected address not found.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const orderType = cartItems.every((item) => item.orderType === "wholesale") ? "wholesale" : "retail";
      const subtotal = cartItems.reduce((sum, item) => {
        const price = item.orderType === "wholesale" && item.medicine.wholesalePrice != null
          ? item.medicine.wholesalePrice
          : item.medicine.discount && item.medicine.discount > 0
            ? item.medicine.price * (1 - item.medicine.discount / 100)
            : item.medicine.price;
        return sum + price * item.quantity;
      }, 0);
      const orderTotal = subtotal + deliveryCharge;
      const orderId = await createOrder(
        currentUser.uid,
        cartItems,
        orderTotal,
        orderType,
        selectedAddress,
        deliveryCharge
      );
      await clearCart(currentUser.uid);
      clearCartContext();
      navigate(`/order-success?orderId=${orderId}`);
      toast({
        title: "Success",
        description: "Order placed successfully!",
      });
    } catch (err: any) {
      setError(err.message || "Failed to place order.");
      toast({
        title: "Error",
        description: err.message || "Failed to place order.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetchingProfile) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (cartCount === 0) {
    return (
      <div className="bg-gray-50 p-10 rounded-lg text-center">
        <h3 className="text-xl font-medium text-gray-800 mb-2">Your Cart is Empty</h3>
        <p className="text-gray-600">Add some items to your cart to place an order.</p>
        <Button className="mt-4" onClick={() => navigate("/")}>
          Shop Now
        </Button>
      </div>
    );
  }

  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.orderType === "wholesale" && item.medicine.wholesalePrice != null
      ? item.medicine.wholesalePrice
      : item.medicine.discount && item.medicine.discount > 0
        ? item.medicine.price * (1 - item.medicine.discount / 100)
        : item.medicine.price;
    return sum + price * item.quantity;
  }, 0);

  return (
    <Card className="m-4 max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Place Order</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Select Shipping Address</h3>
            {userProfile?.addresses && userProfile.addresses.length > 0 ? (
              <div className="space-y-4">
                <RadioGroup
                  value={selectedAddressId || ""}
                  onValueChange={handleAddressChange}
                  className="space-y-2"
                >
                  {userProfile.addresses.map((address) => (
                    <div key={address.id} className="flex items-center space-x-2 p-3 border rounded-lg">
                      <RadioGroupItem value={address.id} id={address.id} />
                      <Label htmlFor={address.id} className="flex-1">
                        <div className="font-medium">{address.type}</div>
                        <div className="text-sm text-gray-600">
                          {address.street}, {address.upazila}, {address.district}, {address.division}, {address.postalCode}
                        </div>
                        <div className="text-sm text-gray-600">
                          Delivery Charge: {cartItems.every((item) => item.orderType === "wholesale") ? "Free" : address.division.toLowerCase() === "dhaka" ? "80 TK" : "120 TK"}
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
                <Button
                  variant="outline"
                  onClick={() => navigate("/dashboard/profile")}
                  className="w-full"
                  aria-label="Add new address"
                >
                  Add New Address
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-600">No addresses found. Please add a new address.</p>
                <Button
                  variant="outline"
                  onClick={() => navigate("/dashboard/profile")}
                  className="w-full"
                  aria-label="Add new address"
                >
                  Add New Address
                </Button>
              </div>
            )}
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Order Summary</h3>
            {cartItems.map((item) => {
              const price = item.orderType === "wholesale" && item.medicine.wholesalePrice != null
                ? item.medicine.wholesalePrice
                : item.medicine.discount && item.medicine.discount > 0
                  ? item.medicine.price * (1 - item.medicine.discount / 100)
                  : item.medicine.price;
              return (
                <div key={item.id} className="flex justify-between mb-2">
                  <span>
                    {item.medicine.name} ({item.orderType.charAt(0).toUpperCase() + item.orderType.slice(1)}, x{item.quantity})
                  </span>
                  <span>{(price * item.quantity).toFixed(2)} TK</span>
                </div>
              );
            })}
            <div className="flex justify-between mb-2">
              <span>Delivery Charge</span>
              <span>{deliveryCharge.toFixed(2)} TK</span>
            </div>
            <div className="flex justify-between font-medium mt-4">
              <span>Total</span>
              <span>{(subtotal + deliveryCharge).toFixed(2)} TK</span>
            </div>
          </div>

          <Button
            className="w-full bg-pharmacy-primary hover:bg-pharmacy-dark"
            onClick={handlePlaceOrder}
            disabled={loading || fetchingProfile}
            aria-label="Place order"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
                Processing...
              </>
            ) : (
              "Place Order"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default Checkout;