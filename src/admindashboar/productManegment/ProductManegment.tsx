import React, { useState, useEffect, ChangeEvent } from 'react';
import { z } from 'zod';
import { Medicine } from '@/lib/types';
import { getAllMedicines, addMedicine, updateMedicine, deleteMedicine } from '@/services/adminProductService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, Plus, Edit, Trash2 } from 'lucide-react';
import Loading from '@/components/common/Loading';
import categoriesData from '@/lib/categories.json';

// Define category and subcategory interfaces
interface Category {
  name: string;
  subcategories: string[];
}

// Zod schema for medicine validation
const medicineSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  price: z.number().min(0, 'Price must be a positive number'),
  wholesalePrice: z.number().min(0, 'Wholesale price must be a positive number').optional().nullable(),
  minWholesaleQuantity: z.number().min(1, 'Minimum wholesale quantity must be at least 1').optional().nullable(),
  imageUrl: z.string().min(1, 'Image is required'),
  category: z.string().min(1, 'Category is required'),
  subcategory: z.string().min(1, 'Subcategory is required'),
  stock: z.number().min(0, 'Stock must be a positive number'),
  discount: z.number().min(0, 'Discount must be a positive number').optional(),
  description: z.string().min(1, 'Description is required'),
});

// Extend Medicine interface to include subcategory
interface ExtendedMedicine extends Medicine {
  subcategory: string;
}

const ProductManegment: React.FC = () => {
  const [medicines, setMedicines] = useState<ExtendedMedicine[]>([]);
  const [filteredMedicines, setFilteredMedicines] = useState<ExtendedMedicine[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<ExtendedMedicine | null>(null);
  const [formData, setFormData] = useState<Omit<ExtendedMedicine, 'id'>>({
    name: '',
    price: 0,
    wholesalePrice: null,
    minWholesaleQuantity: null,
    imageUrl: '',
    category: '',
    subcategory: '',
    stock: 0,
    discount: undefined,
    description: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof Omit<ExtendedMedicine, 'id'>, string>>>({});
  const { toast } = useToast();

  // Categories from categories.json
  const categories: Category[] = categoriesData.categories;
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [subcategories, setSubcategories] = useState<string[]>([]);

  // Fetch medicines on mount
  useEffect(() => {
    fetchMedicines();
  }, []);

  // Filter medicines when search term or category changes
  useEffect(() => {
    let filtered = medicines;
    if (searchTerm) {
      filtered = filtered.filter((medicine) =>
        medicine.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (categoryFilter !== 'All') {
      filtered = filtered.filter((medicine) => medicine.category === categoryFilter);
    }
    setFilteredMedicines(filtered);
  }, [searchTerm, categoryFilter, medicines]);

  // Update subcategories when category changes
  useEffect(() => {
    if (selectedCategory) {
      const category = categories.find((cat) => cat.name === selectedCategory);
      setSubcategories(category ? category.subcategories : []);
      setFormData((prev) => ({ ...prev, subcategory: '' }));
    } else {
      setSubcategories([]);
    }
  }, [selectedCategory]);

  const fetchMedicines = async () => {
    setIsLoading(true);
    try {
      const data = await getAllMedicines();
      setMedicines(data as ExtendedMedicine[]);
      setFilteredMedicines(data as ExtendedMedicine[]);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch medicines.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'price' || name === 'stock' || name === 'discount' || name === 'wholesalePrice' || name === 'minWholesaleQuantity'
          ? value === '' ? (name === 'wholesalePrice' || name === 'minWholesaleQuantity' ? null : 0) : Number(value)
          : value,
    }));
    setFormErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setFormData((prev) => ({ ...prev, category: value }));
    setFormErrors((prev) => ({ ...prev, category: undefined }));
  };

  const handleSubcategoryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, subcategory: value }));
    setFormErrors((prev) => ({ ...prev, subcategory: undefined }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewImage(URL.createObjectURL(file));
      setFormErrors((prev) => ({ ...prev, imageUrl: undefined }));
    }
  };

  const uploadImage = async (): Promise<string> => {
    if (!imageFile) return formData.imageUrl || '';

    setIsUploading(true);
    const formDataUpload = new FormData();
    formDataUpload.append('image', imageFile);

    try {
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMGBB_API_KEY}`, {
        method: 'POST',
        body: formDataUpload,
      });
      const data = await response.json();
      if (data.success) {
        return data.data.url;
      }
      throw new Error('Image upload failed');
    } catch (error) {
      throw new Error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const validateForm = (): boolean => {
    try {
      medicineSchema.parse(formData);
      setFormErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Partial<Record<keyof Omit<ExtendedMedicine, 'id'>, string>> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            errors[err.path[0] as keyof Omit<ExtendedMedicine, 'id'>] = err.message;
          }
        });
        setFormErrors(errors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fill all required fields correctly.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      let imageUrl = formData.imageUrl;
      if (imageFile) {
        imageUrl = await uploadImage();
      }

      const medicineData = { ...formData, imageUrl };

      if (editingMedicine) {
        await updateMedicine(editingMedicine.id, medicineData);
        toast({ title: 'Success', description: 'Medicine updated successfully.' });
      } else {
        await addMedicine(medicineData);
        toast({ title: 'Success', description: 'Medicine added successfully.' });
      }

      await fetchMedicines();
      setIsDialogOpen(false);
      setEditingMedicine(null);
      setFormData({
        name: '',
        price: 0,
        wholesalePrice: null,
        minWholesaleQuantity: null,
        imageUrl: '',
        category: '',
        subcategory: '',
        stock: 0,
        discount: undefined,
        description: '',
      });
      setImageFile(null);
      setPreviewImage(null);
      setSelectedCategory('');
      setFormErrors({});
    } catch (error) {
      toast({
        title: 'Error',
        description: editingMedicine ? 'Failed to update medicine.' : 'Failed to add medicine.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (medicine: ExtendedMedicine) => {
    setEditingMedicine(medicine);
    setFormData({
      name: medicine.name,
      price: medicine.price,
      wholesalePrice: medicine.wholesalePrice,
      minWholesaleQuantity: medicine.minWholesaleQuantity,
      imageUrl: medicine.imageUrl || '',
      category: medicine.category,
      subcategory: medicine.subcategory || '',
      stock: medicine.stock,
      discount: medicine.discount,
      description: medicine.description || '',
    });

    setSelectedCategory(medicine.category);
    const category = categories.find((cat) => cat.name === medicine.category);
    setSubcategories(category ? category.subcategories : []);

    // Ensure subcategory is set after subcategories are updated
    setTimeout(() => {
      setFormData((prev) => ({
        ...prev,
        subcategory: medicine.subcategory || '',
      }));
    }, 0);

    setPreviewImage(medicine.imageUrl || null);
    setFormErrors({});
    setIsDialogOpen(true);
  };

  const handleDelete = async (medicineId: string) => {
    setIsLoading(true);
    try {
      await deleteMedicine(medicineId);
      toast({ title: 'Success', description: 'Medicine deleted successfully.' });
      await fetchMedicines();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete medicine.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Product Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row justify-between mb-4 gap-4">
            <div className="flex items-center gap-2 w-full md:w-1/3">
              <Search className="h-5 w-5 text-gray-500" />
              <Input
                placeholder="Search medicines..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
                disabled={isLoading || isUploading}
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter} disabled={isLoading || isUploading}>
              <SelectTrigger className="w-full md:w-1/4">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                {['All', ...categories.map((cat) => cat.name)].map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) {
                setEditingMedicine(null);
                setFormData({
                  name: '',
                  price: 0,
                  wholesalePrice: null,
                  minWholesaleQuantity: null,
                  imageUrl: '',
                  category: '',
                  subcategory: '',
                  stock: 0,
                  discount: undefined,
                  description: '',
                });
                setImageFile(null);
                setPreviewImage(null);
                setSelectedCategory('');
                setFormErrors({});
              }
            }}>
              <DialogTrigger asChild>
                <Button className="w-full md:w-auto" disabled={isLoading || isUploading}>
                  <Plus className="mr-2 h-4 w-4" /> Add New Medicine
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[90vw] sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingMedicine ? 'Edit Medicine' : 'Add New Medicine'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={isLoading || isUploading}
                      className={formErrors.name ? 'border-red-500' : ''}
                    />
                    {formErrors.name && <p className="text-red-500 text-sm">{formErrors.name}</p>}
                  </div>
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={handleCategoryChange}
                      disabled={isLoading || isUploading}
                    >
                      <SelectTrigger className={formErrors.category ? 'border-red-500' : ''}>
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
                    {formErrors.category && <p className="text-red-500 text-sm">{formErrors.category}</p>}
                  </div>
                  <div>
                    <Label htmlFor="subcategory">Subcategory *</Label>
                    <Select
                      value={formData.subcategory}
                      onValueChange={handleSubcategoryChange}
                      disabled={isLoading || isUploading || !selectedCategory}
                    >
                      <SelectTrigger className={formErrors.subcategory ? 'border-red-500' : ''}>
                        {/* Show current value or placeholder */}
                        <SelectValue placeholder="Select subcategory">
                          {formData.subcategory || editingMedicine?.subcategory}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {subcategories.map((subcategory) => (
                          <SelectItem key={subcategory} value={subcategory}>
                            {subcategory}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formErrors.subcategory && <p className="text-red-500 text-sm">{formErrors.subcategory}</p>}
                  </div>
                  <div>
                    <Label htmlFor="price">Price (৳) *</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={handleInputChange}
                      disabled={isLoading || isUploading}
                      className={formErrors.price ? 'border-red-500' : ''}
                    />
                    {formErrors.price && <p className="text-red-500 text-sm">{formErrors.price}</p>}
                  </div>
                  <div>
                    <Label htmlFor="wholesalePrice">Wholesale Price (৳)</Label>
                    <Input
                      id="wholesalePrice"
                      name="wholesalePrice"
                      type="number"
                      step="0.01"
                      value={formData.wholesalePrice ?? ''}
                      onChange={handleInputChange}
                      disabled={isLoading || isUploading}
                      className={formErrors.wholesalePrice ? 'border-red-500' : ''}
                    />
                    {formErrors.wholesalePrice && <p className="text-red-500 text-sm">{formErrors.wholesalePrice}</p>}
                  </div>
                  <div>
                    <Label htmlFor="minWholesaleQuantity">Minimum Wholesale Quantity</Label>
                    <Input
                      id="minWholesaleQuantity"
                      name="minWholesaleQuantity"
                      type="number"
                      value={formData.minWholesaleQuantity ?? ''}
                      onChange={handleInputChange}
                      disabled={isLoading || isUploading}
                      className={formErrors.minWholesaleQuantity ? 'border-red-500' : ''}
                    />
                    {formErrors.minWholesaleQuantity && (
                      <p className="text-red-500 text-sm">{formErrors.minWholesaleQuantity}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="stock">Stock *</Label>
                    <Input
                      id="stock"
                      name="stock"
                      type="number"
                      value={formData.stock}
                      onChange={handleInputChange}
                      disabled={isLoading || isUploading}
                      className={formErrors.stock ? 'border-red-500' : ''}
                    />
                    {formErrors.stock && <p className="text-red-500 text-sm">{formErrors.stock}</p>}
                  </div>
                  <div>
                    <Label htmlFor="discount">Discount (%)</Label>
                    <Input
                      id="discount"
                      name="discount"
                      type="number"
                      value={formData.discount ?? ''}
                      onChange={handleInputChange}
                      disabled={isLoading || isUploading}
                      className={formErrors.discount ? 'border-red-500' : ''}
                    />
                    {formErrors.discount && <p className="text-red-500 text-sm">{formErrors.discount}</p>}
                  </div>
                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      disabled={isLoading || isUploading}
                      className={`w-full border rounded p-2 min-h-[100px] ${formErrors.description ? 'border-red-500' : ''
                        }`}
                    />
                    {formErrors.description && <p className="text-red-500 text-sm">{formErrors.description}</p>}
                  </div>
                  <div>
                    <Label htmlFor="image">Image *</Label>
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      disabled={isLoading || isUploading}
                      className={formErrors.imageUrl ? 'border-red-500' : ''}
                    />
                    {(previewImage || formData.imageUrl) && (
                      <img
                        src={previewImage || formData.imageUrl}
                        alt="Preview"
                        className="mt-2 h-20 w-20 object-cover rounded"
                      />
                    )}
                    {formErrors.imageUrl && <p className="text-red-500 text-sm">{formErrors.imageUrl}</p>}
                  </div>
                  <Button type="submit" disabled={isLoading || isUploading} className="w-full sm:w-auto">
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : editingMedicine ? (
                      'Update Medicine'
                    ) : (
                      'Add Medicine'
                    )}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {isLoading ? (
            <div className="flex justify-center">
              <Loading />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Wholesale Price</TableHead>
                    <TableHead>Min Wholesale Qty</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMedicines.map((medicine) => (
                    <TableRow key={medicine.id}>
                      <TableCell>
                        {medicine.imageUrl && (
                          <img
                            src={medicine.imageUrl}
                            alt={medicine.name}
                            className="h-12 w-12 object-cover rounded"
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {medicine.name}
                          {medicine.wholesalePrice && (
                            <Badge variant="secondary">Wholesale</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{medicine.category}</span>
                          <span className="text-xs text-muted-foreground">
                            {medicine.subcategory}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>৳{medicine.price.toFixed(2)}</TableCell>
                      <TableCell>
                        {medicine.wholesalePrice ? `৳${medicine.wholesalePrice.toFixed(2)}` : 'N/A'}
                      </TableCell>
                      <TableCell>{medicine.minWholesaleQuantity ?? 'N/A'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {medicine.stock}
                          {medicine.stock < 10 && (
                            <Badge variant="destructive">Low Stock</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{medicine.discount ? `${medicine.discount}%` : 'N/A'}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(medicine)}
                            disabled={isLoading || isUploading}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(medicine.id)}
                            disabled={isLoading || isUploading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductManegment;