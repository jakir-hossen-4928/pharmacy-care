import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";
import { addMedicine } from "@/services/adminProductService";
import { Medicine } from "@/lib/types";
import categoriesData from "@/lib/categories.json";

// Define category and subcategory interfaces
interface Category {
  name: string;
  subcategories: string[];
}

// Zod schema for form validation
const productSchema = z
  .object({
    name: z.string().min(1, "Product name is required"),
    category: z.string().min(1, "Category is required"),
    subcategory: z.string().min(1, "Subcategory is required"),
    price: z.number().gt(0, "Price must be greater than 0"),
    wholesalePrice: z.number().gt(0, "Wholesale price must be greater than 0").optional().or(z.literal(undefined)),
    minWholesaleQuantity: z
      .number()
      .gt(0, "Minimum wholesale quantity must be greater than 0")
      .optional()
      .or(z.literal(undefined)),
    stock: z.number().gte(0, "Stock cannot be negative"),
    discount: z.number().gte(0, "Discount must be between 0 and 100").lte(100).optional().or(z.literal(0)),
    description: z.string().min(1, "Description is required"),
    imageUrl: z.string().min(1, "Image URL is required"),
  })
  .refine(
    (data) => !data.wholesalePrice || (data.wholesalePrice && data.minWholesaleQuantity),
    {
      message: "Minimum wholesale quantity is required if wholesale price is set",
      path: ["minWholesaleQuantity"],
    }
  )
  .refine(
    (data) => !data.minWholesaleQuantity || (data.minWholesaleQuantity && data.wholesalePrice),
    {
      message: "Wholesale price is required if minimum wholesale quantity is set",
      path: ["wholesalePrice"],
    }
  );

interface FormData {
  name: string;
  category: string;
  subcategory: string;
  price: string;
  wholesalePrice: string;
  minWholesaleQuantity: string;
  stock: string;
  discount: string;
  description: string;
  imageUrl: string;
}

interface FormErrors {
  name?: string;
  category?: string;
  subcategory?: string;
  price?: string;
  wholesalePrice?: string;
  minWholesaleQuantity?: string;
  stock?: string;
  discount?: string;
  description?: string;
  imageUrl?: string;
}

const AddNewProduct = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    category: "",
    subcategory: "",
    price: "",
    wholesalePrice: "",
    minWholesaleQuantity: "",
    stock: "",
    discount: "",
    description: "",
    imageUrl: "",
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Get categories from categories.json
  const categories: Category[] = categoriesData.categories;

  // Get subcategories for the selected category
  const selectedCategory = categories.find((cat) => cat.name === formData.category);
  const subcategories = selectedCategory ? selectedCategory.subcategories : [];

  // Handle form field changes
  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      // Reset subcategory if category changes
      ...(field === "category" ? { subcategory: "" } : {}),
    }));
    setFormErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  // Validate form with Zod
  const validateForm = (): boolean => {
    const parsedData = {
      name: formData.name,
      category: formData.category,
      subcategory: formData.subcategory,
      price: formData.price ? parseFloat(formData.price) : 0,
      wholesalePrice: formData.wholesalePrice ? parseFloat(formData.wholesalePrice) : undefined,
      minWholesaleQuantity: formData.minWholesaleQuantity
        ? parseInt(formData.minWholesaleQuantity)
        : undefined,
      stock: formData.stock ? parseInt(formData.stock) : 0,
      discount: formData.discount ? parseFloat(formData.discount) : 0,
      description: formData.description,
      imageUrl: formData.imageUrl,
    };
    const result = productSchema.safeParse(parsedData);
    if (!result.success) {
      const errors: FormErrors = {};
      result.error.issues.forEach((issue) => {
        errors[issue.path[0] as keyof FormErrors] = issue.message;
      });
      setFormErrors(errors);
      return false;
    }
    setFormErrors({});
    return true;
  };

  // Image upload to ImgBB
  const uploadImageToImgBB = async (file: File): Promise<string> => {
    const IMAGE_HOST_KEY = import.meta.env.VITE_IMGBB_API_KEY;
    if (!IMAGE_HOST_KEY) {
      throw new Error("ImgBB API key not configured");
    }

    const formData = new FormData();
    formData.append("image", file);

    setIsUploading(true);
    try {
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMAGE_HOST_KEY}`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error(`ImgBB upload failed with status ${response.status}`);
      }
      const data = await response.json();
      if (!data.success || !data.data?.url) {
        throw new Error("Invalid response from ImgBB");
      }
      return data.data.url;
    } catch (error: any) {
      throw new Error(error.message || "Failed to upload image to ImgBB");
    } finally {
      setIsUploading(false);
    }
  };

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/gif"].includes(file.type)) {
      toast({
        title: "Error",
        description: "Please upload a JPEG, PNG, or GIF image",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Image size should be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));

    try {
      const photoUrl = await uploadImageToImgBB(file);
      setFormData((prev) => ({ ...prev, imageUrl: photoUrl }));
      setFormErrors((prev) => ({ ...prev, imageUrl: undefined }));
      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to upload image. Please try again.",
        variant: "destructive",
      });
      setSelectedImage(null);
      setPreviewUrl(null);
    }
  };

  // Handle image removal
  const handleRemoveImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setFormData((prev) => ({ ...prev, imageUrl: "" }));
    setFormErrors((prev) => ({ ...prev, imageUrl: undefined }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsProcessing(true);
    try {
      const newMedicine: Omit<Medicine, "id"> = {
        name: formData.name,
        category: `${formData.category}:${formData.subcategory}`,
        price: parseFloat(formData.price),
        wholesalePrice: formData.wholesalePrice ? parseFloat(formData.wholesalePrice) : null,
        minWholesaleQuantity: formData.minWholesaleQuantity
          ? parseInt(formData.minWholesaleQuantity)
          : null,
        stock: parseInt(formData.stock),
        discount: formData.discount ? parseFloat(formData.discount) : undefined,
        description: formData.description,
        imageUrl: formData.imageUrl,
      };
      const medicineId = await addMedicine(newMedicine);
      toast({
        title: "Success",
        description: `Product "${formData.name}" added with ID: ${medicineId}`,
      });
      // Reset form
      setFormData({
        name: "",
        category: "",
        subcategory: "",
        price: "",
        wholesalePrice: "",
        minWholesaleQuantity: "",
        stock: "",
        discount: "",
        description: "",
        imageUrl: "",
      });
      setSelectedImage(null);
      setPreviewUrl(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add product",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-blue-600">Add New Product</h1>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl p-6 max-w-2xl mx-auto"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Product Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Enter product name"
                className={`text-sm ${formErrors.name ? "border-red-500" : ""} focus:ring-2 focus:ring-blue-500 w-full`}
                disabled={isProcessing || isUploading}
                autoComplete="off"
                aria-invalid={!!formErrors.name}
                aria-describedby={formErrors.name ? "name-error" : undefined}
              />
              {formErrors.name && (
                <p id="name-error" className="text-red-500 text-xs mt-1">{formErrors.name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-medium">
                Category <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleChange("category", value)}
                disabled={isProcessing || isUploading}
              >
                <SelectTrigger
                  className={`text-sm ${formErrors.category ? "border-red-500" : ""} w-full`}
                >
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.name} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.category && (
                <p className="text-red-500 text-xs mt-1">{formErrors.category}</p>
              )}
            </div>
          </div>
          {formData.category && (
            <div className="space-y-2">
              <Label htmlFor="subcategory" className="text-sm font-medium">
                Subcategory <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.subcategory}
                onValueChange={(value) => handleChange("subcategory", value)}
                disabled={isProcessing || isUploading || !formData.category}
              >
                <SelectTrigger
                  className={`text-sm ${formErrors.subcategory ? "border-red-500" : ""} w-full`}
                >
                  <SelectValue placeholder="Select subcategory" />
                </SelectTrigger>
                <SelectContent>
                  {subcategories.map((subcategory) => (
                    <SelectItem key={subcategory} value={subcategory}>
                      {subcategory}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.subcategory && (
                <p className="text-red-500 text-xs mt-1">{formErrors.subcategory}</p>
              )}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price" className="text-sm font-medium">
                Retail Price (৳) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => handleChange("price", e.target.value)}
                placeholder="Enter retail price"
                className={`text-sm ${formErrors.price ? "border-red-500" : ""} focus:ring-2 focus:ring-blue-500 w-full`}
                min="0"
                step="0.01"
                disabled={isProcessing || isUploading}
                autoComplete="off"
                aria-invalid={!!formErrors.price}
                aria-describedby={formErrors.price ? "price-error" : undefined}
              />
              {formErrors.price && (
                <p id="price-error" className="text-red-500 text-xs mt-1">{formErrors.price}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock" className="text-sm font-medium">
                Stock <span className="text-red-500">*</span>
              </Label>
              <Input
                id="stock"
                type="number"
                value={formData.stock}
                onChange={(e) => handleChange("stock", e.target.value)}
                placeholder="Enter stock quantity"
                className={`text-sm ${formErrors.stock ? "border-red-500" : ""} focus:ring-2 focus:ring-blue-500 w-full`}
                min="0"
                disabled={isProcessing || isUploading}
                autoComplete="off"
                aria-invalid={!!formErrors.stock}
                aria-describedby={formErrors.stock ? "stock-error" : undefined}
              />
              {formErrors.stock && (
                <p id="stock-error" className="text-red-500 text-xs mt-1">{formErrors.stock}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="wholesalePrice" className="text-sm font-medium">
                Wholesale Price (৳, optional)
              </Label>
              <Input
                id="wholesalePrice"
                type="number"
                value={formData.wholesalePrice}
                onChange={(e) => handleChange("wholesalePrice", e.target.value)}
                placeholder="Enter wholesale price"
                className={`text-sm ${formErrors.wholesalePrice ? "border-red-500" : ""} focus:ring-2 focus:ring-blue-500 w-full`}
                min="0"
                step="0.01"
                disabled={isProcessing || isUploading}
                autoComplete="off"
                aria-invalid={!!formErrors.wholesalePrice}
                aria-describedby={formErrors.wholesalePrice ? "wholesalePrice-error" : undefined}
              />
              {formErrors.wholesalePrice && (
                <p id="wholesalePrice-error" className="text-red-500 text-xs mt-1">
                  {formErrors.wholesalePrice}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="minWholesaleQuantity" className="text-sm font-medium">
                Min Wholesale Quantity (optional)
              </Label>
              <Input
                id="minWholesaleQuantity"
                type="number"
                value={formData.minWholesaleQuantity}
                onChange={(e) => handleChange("minWholesaleQuantity", e.target.value)}
                placeholder="Enter min wholesale quantity"
                className={`text-sm ${formErrors.minWholesaleQuantity ? "border-red-500" : ""} focus:ring-2 focus:ring-blue-500 w-full`}
                min="0"
                disabled={isProcessing || isUploading}
                autoComplete="off"
                aria-invalid={!!formErrors.minWholesaleQuantity}
                aria-describedby={
                  formErrors.minWholesaleQuantity ? "minWholesaleQuantity-error" : undefined
                }
              />
              {formErrors.minWholesaleQuantity && (
                <p id="minWholesaleQuantity-error" className="text-red-500 text-xs mt-1">
                  {formErrors.minWholesaleQuantity}
                </p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="discount" className="text-sm font-medium">
              Discount (%)
            </Label>
            <Input
              id="discount"
              type="number"
              value={formData.discount}
              onChange={(e) => handleChange("discount", e.target.value)}
              placeholder="Enter discount percentage"
              className={`text-sm ${formErrors.discount ? "border-red-500" : ""} focus:ring-2 focus:ring-blue-500 w-full`}
              min="0"
              max="100"
              disabled={isProcessing || isUploading}
              autoComplete="off"
              aria-invalid={!!formErrors.discount}
              aria-describedby={formErrors.discount ? "discount-error" : undefined}
            />
            {formErrors.discount && (
              <p id="discount-error" className="text-red-500 text-xs mt-1">{formErrors.discount}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description <span className="text-red-500">*</span>
            </Label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Enter product description"
              className={`w-full border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 min-h-[100px] ${formErrors.description ? "border-red-500" : ""}`}
              rows={4}
              disabled={isProcessing || isUploading}
              autoComplete="off"
              aria-invalid={!!formErrors.description}
              aria-describedby={formErrors.description ? "description-error" : undefined}
            />
            {formErrors.description && (
              <p id="description-error" className="text-red-500 text-xs mt-1">
                {formErrors.description}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="image" className="text-sm font-medium">
              Product Image <span className="text-red-500">*</span>
            </Label>
            <div className="flex items-center gap-4">
              <div className="relative">
                {previewUrl ? (
                  <>
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-20 h-20 rounded-lg object-cover border border-gray-200"
                      onError={() =>
                        toast({
                          title: "Error",
                          description: "Failed to load image preview. Please try uploading again.",
                          variant: "destructive",
                        })
                      }
                    />
                    <button
                      onClick={handleRemoveImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                      disabled={isProcessing || isUploading}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <div className="w-20 h-20 flex items-center justify-center bg-gray-100 rounded-lg">
                    <span className="text-gray-400 text-sm">No image</span>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2 flex-1">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                  disabled={isProcessing || isUploading}
                />
                <label
                  htmlFor="image-upload"
                  className={`px-4 py-2 bg-blue-600 text-white rounded-lg text-center text-sm transition-colors ${
                    isProcessing || isUploading
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-blue-700 cursor-pointer"
                  }`}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="animate-spin inline-block mr-2" size={16} />
                      Uploading...
                    </>
                  ) : (
                    "Upload Image"
                  )}
                </label>
                <span className="text-xs text-gray-500">Recommended size: 300x300px, Max 5MB</span>
              </div>
            </div>
            {formErrors.imageUrl && (
              <p id="image-error" className="text-red-500 text-xs mt-1">{formErrors.imageUrl}</p>
            )}
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setFormData({
                  name: "",
                  category: "",
                  subcategory: "",
                  price: "",
                  wholesalePrice: "",
                  minWholesaleQuantity: "",
                  stock: "",
                  discount: "",
                  description: "",
                  imageUrl: "",
                })
              }
              disabled={isProcessing || isUploading}
              className="flex-1 border-gray-300 hover:bg-gray-100 transition-colors duration-200 text-sm"
            >
              Reset
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 transition-colors duration-200 text-sm text-white"
              disabled={isProcessing || isUploading}
            >
              {isProcessing ? (
                <Loader2 className="animate-spin mr-2" size={16} />
              ) : (
                <Plus size={16} className="mr-2" />
              )}
              {isProcessing ? "Adding..." : "Add Product"}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AddNewProduct;
