import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getUserProfile, updateUserProfile, addUserAddress, updateUserAddress, deleteUserAddress } from "@/services/userProfieService";
import { User, Address } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileWarning, Loader2, Trash2, Edit, Plus, Star } from "lucide-react";
import { toast } from "react-toastify";
import { z } from "zod";
import Loading from "@/components/common/Loading";
import { BDLocations } from "react-bd-location";


interface Address {
  id: string;
  type: "Home" | "Office" | "Shop";
  street: string;
  division: string;
  district: string;
  upazila: string;
  postalCode: string;
  isDefault?: boolean;
}

// Zod schema for address validation
const addressSchema = z.object({
  type: z.enum(["Home", "Office", "Shop"], { message: "Please select an address type" }),
  street: z.string().min(1, "Street is required"),
  division: z.string().min(1, "Division is required"),
  district: z.string().min(1, "District is required"),
  upazila: z.string().min(1, "Upazila is required"),
  postalCode: z.string().regex(/^\d{4,10}$/, "Postal code must be 4-10 digits"),
});

type AddressFormData = z.infer<typeof addressSchema>;
type AddressErrors = Partial<Record<keyof AddressFormData, string>>;

const UserProfile = () => {
  const { currentUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: "", email: "", phone: "" });
  const [profileErrors, setProfileErrors] = useState({ name: "", phone: "" });
  const [isAddAddressModalOpen, setIsAddAddressModalOpen] = useState(false);
  const [isEditAddressModalOpen, setIsEditAddressModalOpen] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState<AddressFormData>({
    type: "Home",
    street: "",
    division: "",
    district: "",
    upazila: "",
    postalCode: "",
  });
  const [addressErrors, setAddressErrors] = useState<AddressErrors>({});
  const [operationLoading, setOperationLoading] = useState<string | null>(null);

  // Validate address form and update errors
  const validateAddressForm = useCallback(() => {
    const result = addressSchema.safeParse(addressForm);
    if (!result.success) {
      const newErrors: AddressErrors = {};
      result.error.issues.forEach((issue) => {
        newErrors[issue.path[0] as keyof AddressFormData] = issue.message;
      });
      setAddressErrors(newErrors);
      return false;
    }
    setAddressErrors({});
    return true;
  }, [addressForm]);

  // Update address form and validate
  const updateAddressForm = useCallback((updates: Partial<AddressFormData>) => {
    setAddressForm((prev) => {
      const newForm = { ...prev, ...updates };
      // Trigger validation after state update
      setTimeout(() => validateAddressForm(), 0);
      return newForm;
    });
  }, [validateAddressForm]);

  useEffect(() => {
    if (currentUser) {
      fetchUserProfile();
    }
  }, [currentUser]);

  async function fetchUserProfile() {
    if (!currentUser) return;
    try {
      setLoading(true);
      const userData = await getUserProfile(currentUser.uid);
      if (userData) {
        setUser(userData);
        setProfileForm({
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
        });
      } else {
        setError("User profile not found");
      }
    } catch (err) {
      setError("Failed to load profile");
      toast.error("Failed to load profile");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const validateProfileForm = () => {
    const errors = { name: "", phone: "" };
    let isValid = true;
    if (!profileForm.name.trim()) {
      errors.name = "Name is required";
      isValid = false;
    }
    if (!profileForm.phone.trim() || !/^\+?\d{10,15}$/.test(profileForm.phone)) {
      errors.phone = "Valid phone number is required (10-15 digits)";
      isValid = false;
    }
    setProfileErrors(errors);
    return isValid;
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateProfileForm()) return;
    if (!currentUser) return;
    setOperationLoading("profile");
    try {
      await updateUserProfile(currentUser.uid, {
        name: profileForm.name,
        phone: profileForm.phone,
      });
      setUser((prev) =>
        prev ? { ...prev, name: profileForm.name, phone: profileForm.phone } : prev
      );
      setIsEditingProfile(false);
      toast.success("Profile updated successfully", { position: "top-right", autoClose: 3000 });
    } catch (err) {
      toast.error("Failed to update profile", { position: "top-right", autoClose: 3000 });
      console.error(err);
    } finally {
      setOperationLoading(null);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAddressForm()) return;
    if (!currentUser) return;
    setOperationLoading("add-address");
    try {
      const isDefault = !user?.addresses || user.addresses.length === 0;
      await addUserAddress(currentUser.uid, { ...addressForm, isDefault });
      await fetchUserProfile();
      setAddressForm({ type: "Home", street: "", division: "", district: "", upazila: "", postalCode: "" });
      setIsAddAddressModalOpen(false);
      toast.success("Address added successfully", { position: "top-right", autoClose: 3000 });
    } catch (err) {
      toast.error("Failed to add address", { position: "top-right", autoClose: 3000 });
      console.error(err);
    } finally {
      setOperationLoading(null);
    }
  };

  const handleEditAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAddressForm() || !isEditAddressModalOpen || !currentUser) return;
    setOperationLoading(`edit-address-${isEditAddressModalOpen}`);
    try {
      const existingAddress = user?.addresses?.find((addr) => addr.id === isEditAddressModalOpen);
      await updateUserAddress(currentUser.uid, {
        ...addressForm,
        id: isEditAddressModalOpen,
        isDefault: existingAddress?.isDefault || false,
      });
      await fetchUserProfile();
      setAddressForm({ type: "Home", street: "", division: "", district: "", upazila: "", postalCode: "" });
      setIsEditAddressModalOpen(null);
      toast.success("Address updated successfully", { position: "top-right", autoClose: 3000 });
    } catch (err) {
      toast.error("Failed to update address", { position: "top-right", autoClose: 3000 });
      console.error(err);
    } finally {
      setOperationLoading(null);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!currentUser) return;
    setOperationLoading(`delete-address-${addressId}`);
    try {
      await deleteUserAddress(currentUser.uid, addressId);
      if (user?.addresses?.find((addr) => addr.id === addressId)?.isDefault && user.addresses.length > 1) {
        const newDefaultAddress = user.addresses.find((addr) => addr.id !== addressId);
        if (newDefaultAddress) {
          await updateUserAddress(currentUser.uid, { ...newDefaultAddress, isDefault: true });
        }
      }
      await fetchUserProfile();
      toast.success("Address deleted successfully", { position: "top-right", autoClose: 3000 });
    } catch (err) {
      toast.error("Failed to delete address", { position: "top-right", autoClose: 3000 });
      console.error(err);
    } finally {
      setOperationLoading(null);
    }
  };

  const handleSetDefaultAddress = async (addressId: string) => {
    if (!currentUser || !user) return;
    setOperationLoading(`set-default-${addressId}`);
    try {
      const updatedAddresses = user.addresses?.map((addr) => ({
        ...addr,
        isDefault: addr.id === addressId,
      }));
      await updateUserProfile(currentUser.uid, { addresses: updatedAddresses });
      await fetchUserProfile();
      toast.success("Default address updated successfully", { position: "top-right", autoClose: 3000 });
    } catch (err) {
      toast.error("Failed to set default address", { position: "top-right", autoClose: 3000 });
      console.error(err);
    } finally {
      setOperationLoading(null);
    }
  };

  const startEditingAddress = (address: Address) => {
    setIsEditAddressModalOpen(address.id);
    setAddressForm({
      type: address.type,
      street: address.street,
      division: address.division,
      district: address.district,
      upazila: address.upazila,
      postalCode: address.postalCode,
    });
    setAddressErrors({}); // Clear errors when editing starts
  };

  // Handle BDLocations change
  const handleBDLocationsChange = useCallback(
    (e: any) => {
      console.log("BDLocations onChange:", e);
      const updates: Partial<AddressFormData> = {};
      if (e.name && !e.division_id && !e.district_id) {
        updates.division = e.name;
      } else if (e.division_id && !e.district_id) {
        updates.district = e.name;
      } else if (e.district_id) {
        updates.upazila = e.name;
      }
      updateAddressForm(updates);
    },
    [updateAddressForm]
  );

  if (loading) {
    return <Loading />;
  }

  if (error || !user) {
    return (
      <div className="bg-red-50 p-6 rounded-lg text-center max-w-md mx-auto">
        <FileWarning size={32} className="mx-auto text-red-500 mb-4 sm:size-48" />
        <h3 className="text-lg sm:text-xl font-medium text-red-800 mb-2">Error Loading Profile</h3>
        <p className="text-red-700 text-sm sm:text-base">{error || "User not found"}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <Card className="mb-6 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl text-pharmacy-primary">Profile Information</CardTitle>
        </CardHeader>
        <CardContent>
          {isEditingProfile ? (
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm sm:text-base font-medium">Name</Label>
                <Input
                  id="name"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className={`text-sm sm:text-base ${profileErrors.name ? "border-red-500" : ""} focus:ring-2 focus:ring-pharmacy-primary transition-colors`}
                  aria-invalid={!!profileErrors.name}
                  aria-describedby={profileErrors.name ? "name-error" : undefined}
                />
                {profileErrors.name && (
                  <p id="name-error" className="text-red-500 text-xs sm:text-sm mt-1">{profileErrors.name}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm sm:text-base font-medium">Email (read-only)</Label>
                <Input id="email" value={profileForm.email} disabled className="text-sm sm:text-base" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm sm:text-base font-medium">Phone</Label>
                <Input
                  id="phone"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className={`text-sm sm:text-base ${profileErrors.phone ? "border-red-500" : ""} focus:ring-2 focus:ring-pharmacy-primary transition-colors`}
                  aria-invalid={!!profileErrors.phone}
                  aria-describedby={profileErrors.phone ? "phone-error" : undefined}
                />
                {profileErrors.phone && (
                  <p id="phone-error" className="text-red-500 text-xs sm:text-sm mt-1">{profileErrors.phone}</p>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  type="submit"
                  disabled={operationLoading === "profile"}
                  className="w-full bg-pharmacy-primary hover:bg-pharmacy-dark transition-colors duration-200 text-sm sm:text-base"
                >
                  {operationLoading === "profile" ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    "Save"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditingProfile(false)}
                  disabled={operationLoading === "profile"}
                  className="w-full border-gray-300 hover:bg-gray-100 transition-colors duration-200 text-sm sm:text-base"
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <Label className="text-sm sm:text-base font-medium">Name</Label>
                <p className="text-sm sm:text-base">{user.name}</p>
              </div>
              <div>
                <Label className="text-sm sm:text-base font-medium">Email</Label>
                <p className="text-sm sm:text-base">{user.email}</p>
              </div>
              <div>
                <Label className="text-sm sm:text-base font-medium">Phone</Label>
                <p className="text-sm sm:text-base">{user.phone}</p>
              </div>
              <Button
                onClick={() => setIsEditingProfile(true)}
                className="bg-pharmacy-primary hover:bg-pharmacy-dark transition-colors duration-200 text-sm sm:text-base"
              >
                Edit Profile
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl text-pharmacy-primary">Addresses</CardTitle>
        </CardHeader>
        <CardContent>
          {user.addresses && user.addresses.length > 0 ? (
            <ul className="space-y-4 max-h-[400px] overflow-y-auto">
              {user.addresses.map((address) => (
                <li key={address.id} className="border p-4 rounded-lg">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm sm:text-base">{address.type}</p>
                        {address.isDefault && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Default</span>
                        )}
                      </div>
                      <p className="text-sm sm:text-base">{address.street}</p>
                      <p className="text-sm sm:text-base">
                        {address.upazila}, {address.district}, {address.division}, {address.postalCode}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {!address.isDefault && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleSetDefaultAddress(address.id)}
                          disabled={operationLoading === `set-default-${address.id}`}
                          aria-label={`Set ${address.type} as default address`}
                        >
                          {operationLoading === `set-default-${address.id}` ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Star size={16} />
                          )}
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => startEditingAddress(address)}
                        disabled={!!operationLoading}
                        aria-label={`Edit ${address.type} address`}
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDeleteAddress(address.id)}
                        disabled={operationLoading === `delete-address-${address.id}`}
                        aria-label={`Delete ${address.type} address`}
                      >
                        {operationLoading === `delete-address-${address.id}` ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600 text-sm sm:text-base">No addresses added yet.</p>
          )}
          <Dialog open={isAddAddressModalOpen} onOpenChange={setIsAddAddressModalOpen}>
            <DialogTrigger asChild>
              <Button
                className="mt-4 bg-pharmacy-primary hover:bg-pharmacy-dark transition-colors duration-200 text-sm sm:text-base"
                disabled={!!operationLoading}
              >
                <Plus className="mr-2 h-4 w-4" /> Add Address
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[90vw] sm:max-w-lg max-h-[90vh] overflow-y-auto p-6">
              <DialogHeader>
                <DialogTitle className="text-lg sm:text-xl text-pharmacy-primary">Add New Address</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddAddress} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="type" className="text-sm sm:text-base font-medium">Address Type</Label>
                  <Select
                    value={addressForm.type}
                    onValueChange={(value) => updateAddressForm({ type: value as Address["type"] })}
                  >
                    <SelectTrigger className="text-sm sm:text-base w-full">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Home">Home</SelectItem>
                      <SelectItem value="Office">Office</SelectItem>
                      <SelectItem value="Shop">Shop</SelectItem>
                    </SelectContent>
                  </Select>
                  {addressErrors.type && (
                    <p className="text-red-500 text-xs sm:text-sm mt-1">{addressErrors.type}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm sm:text-base font-medium">Location</Label>
                  <BDLocations
                    onChange={handleBDLocationsChange}
                    value={{
                      division: addressForm.division,
                      district: addressForm.district,
                      upazila: addressForm.upazila,
                    }}
                    bn={false}
                    showLable={true}
                    className="w-full"
                    label={{
                      division: "Division",
                      district: "District",
                      upazila: "Upazila",
                    }}
                    placeholder={{
                      division: "Select Division",
                      district: "Select District",
                      upazila: "Select Upazila",
                    }}
                  />
                  {addressErrors.division && (
                    <p className="text-red-500 text-xs sm:text-sm mt-1">{addressErrors.division}</p>
                  )}
                  {addressErrors.district && (
                    <p className="text-red-500 text-xs sm:text-sm mt-1">{addressErrors.district}</p>
                  )}
                  {addressErrors.upazila && (
                    <p className="text-red-500 text-xs sm:text-sm mt-1">{addressErrors.upazila}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="street" className="text-sm sm:text-base font-medium">Street</Label>
                  <Input
                    id="street"
                    value={addressForm.street}
                    onChange={(e) => updateAddressForm({ street: e.target.value })}
                    className={`text-sm sm:text-base w-full ${addressErrors.street ? "border-red-500" : ""} focus:ring-2 focus:ring-pharmacy-primary transition-colors`}
                    aria-invalid={!!addressErrors.street}
                    aria-describedby={addressErrors.street ? "street-error" : undefined}
                  />
                  {addressErrors.street && (
                    <p id="street-error" className="text-red-500 text-xs sm:text-sm mt-1">{addressErrors.street}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode" className="text-sm sm:text-base font-medium">Postal Code</Label>
                  <Input
                    id="postalCode"
                    value={addressForm.postalCode}
                    onChange={(e) => updateAddressForm({ postalCode: e.target.value })}
                    className={`text-sm sm:text-base w-full ${addressErrors.postalCode ? "border-red-500" : ""} focus:ring-2 focus:ring-pharmacy-primary transition-colors`}
                    aria-invalid={!!addressErrors.postalCode}
                    aria-describedby={addressErrors.postalCode ? "postalCode-error" : undefined}
                  />
                  {addressErrors.postalCode && (
                    <p id="postalCode-error" className="text-red-500 text-xs sm:text-sm mt-1">{addressErrors.postalCode}</p>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    type="submit"
                    disabled={operationLoading === "add-address"}
                    className="w-full bg-pharmacy-primary hover:bg-pharmacy-dark transition-colors duration-200 text-sm sm:text-base"
                  >
                    {operationLoading === "add-address" ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      "Add Address"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsAddAddressModalOpen(false);
                      setAddressErrors({});
                    }}
                    disabled={operationLoading === "add-address"}
                    className="w-full border-gray-300 hover:bg-gray-100 transition-colors duration-200 text-sm sm:text-base"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={!!isEditAddressModalOpen} onOpenChange={() => setIsEditAddressModalOpen(null)}>
            <DialogContent className="max-w-[90vw] sm:max-w-lg max-h-[90vh] overflow-y-auto p-6">
              <DialogHeader>
                <DialogTitle className="text-lg sm:text-xl text-pharmacy-primary">Edit Address</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleEditAddress} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="type" className="text-sm sm:text-base font-medium">Address Type</Label>
                  <Select
                    value={addressForm.type}
                    onValueChange={(value) => updateAddressForm({ type: value as Address["type"] })}
                  >
                    <SelectTrigger className="text-sm sm:text-base w-full">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Home">Home</SelectItem>
                      <SelectItem value="Office">Office</SelectItem>
                      <SelectItem value="Shop">Shop</SelectItem>
                    </SelectContent>
                  </Select>
                  {addressErrors.type && (
                    <p className="text-red-500 text-xs sm:text-sm mt-1">{addressErrors.type}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm sm:text-base font-medium">Location</Label>
                  <BDLocations
                    onChange={handleBDLocationsChange}
                    value={{
                      division: addressForm.division,
                      district: addressForm.district,
                      upazila: addressForm.upazila,
                    }}
                    bn={false}
                    showLable={true}
                    className="w-full"
                    label={{
                      division: "Division",
                      district: "District",
                      upazila: "Upazila",
                    }}
                    placeholder={{
                      division: "Select Division",
                      district: "Select District",
                      upazila: "Select Upazila",
                    }}
                  />
                  {addressErrors.division && (
                    <p className="text-red-500 text-xs sm:text-sm mt-1">{addressErrors.division}</p>
                  )}
                  {addressErrors.district && (
                    <p className="text-red-500 text-xs sm:text-sm mt-1">{addressErrors.district}</p>
                  )}
                  {addressErrors.upazila && (
                    <p className="text-red-500 text-xs sm:text-sm mt-1">{addressErrors.upazila}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="street" className="text-sm sm:text-base font-medium">Street</Label>
                  <Input
                    id="street"
                    value={addressForm.street}
                    onChange={(e) => updateAddressForm({ street: e.target.value })}
                    className={`text-sm sm:text-base w-full ${addressErrors.street ? "border-red-500" : ""} focus:ring-2 focus:ring-pharmacy-primary transition-colors`}
                    aria-invalid={!!addressErrors.street}
                    aria-describedby={addressErrors.street ? "street-error" : undefined}
                  />
                  {addressErrors.street && (
                    <p id="street-error" className="text-red-500 text-xs sm:text-sm mt-1">{addressErrors.street}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode" className="text-sm sm:text-base font-medium">Postal Code</Label>
                  <Input
                    id="postalCode"
                    value={addressForm.postalCode}
                    onChange={(e) => updateAddressForm({ postalCode: e.target.value })}
                    className={`text-sm sm:text-base w-full ${addressErrors.postalCode ? "border-red-500" : ""} focus:ring-2 focus:ring-pharmacy-primary transition-colors`}
                    aria-invalid={!!addressErrors.postalCode}
                    aria-describedby={addressErrors.postalCode ? "postalCode-error" : undefined}
                  />
                  {addressErrors.postalCode && (
                    <p id="postalCode-error" className="text-red-500 text-xs sm:text-sm mt-1">{addressErrors.postalCode}</p>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    type="submit"
                    disabled={operationLoading === `edit-address-${isEditAddressModalOpen}`}
                    className="w-full bg-pharmacy-primary hover:bg-pharmacy-dark transition-colors duration-200 text-sm sm:text-base"
                  >
                    {operationLoading === `edit-address-${isEditAddressModalOpen}` ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      "Save Address"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditAddressModalOpen(null);
                      setAddressErrors({});
                    }}
                    disabled={operationLoading === `edit-address-${isEditAddressModalOpen}`}
                    className="w-full border-gray-300 hover:bg-gray-100 transition-colors duration-200 text-sm sm:text-base"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfile;
