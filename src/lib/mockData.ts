
import { Medicine } from "./types";

export const categories = [
  {
    id: "dilutions",
    name: "DILUTIONS & POTENCIES",
    subcategories: ["30 CH", "200 CH", "1M", "10M"]
  },
  {
    id: "tinctures",
    name: "MOTHER TINCTURES",
    subcategories: ["Single", "Combinations"]
  },
  {
    id: "biochemics",
    name: "BIOCHEMICS",
    subcategories: ["Tablets", "Combinations"]
  },
  {
    id: "tablets",
    name: "TABLETS",
    subcategories: ["Single", "Combinations"]
  },
  {
    id: "cosmetics",
    name: "COSMETICS ITEMS",
    subcategories: ["Hair Care", "Skin Care", "Body Care"]
  }
];

export const mockMedicines: Medicine[] = [
  {
    id: "1",
    name: "Arnica Montana",
    price: 150,
    category: "DILUTIONS & POTENCIES",
    description: "Used for injuries, bruises, and muscle soreness.",
    imageUrl: "https://lovable-uploads.s3.amazonaws.com/7f3fe22b-6695-4f65-a761-cb19edbf7da6.png",
    stock: 50,
    createdAt: new Date(),
    discount: 10
  },
  {
    id: "2",
    name: "Nux Vomica",
    price: 120,
    category: "MOTHER TINCTURES",
    description: "Digestive problems and stress relief.",
    imageUrl: "https://lovable-uploads.s3.amazonaws.com/7f3fe22b-6695-4f65-a761-cb19edbf7da6.png",
    stock: 45,
    createdAt: new Date(),
  },
  {
    id: "3",
    name: "Calc Phos",
    price: 180,
    category: "BIOCHEMICS",
    description: "Supports bone health and calcium absorption.",
    imageUrl: "https://lovable-uploads.s3.amazonaws.com/7f3fe22b-6695-4f65-a761-cb19edbf7da6.png",
    stock: 30,
    createdAt: new Date(),
    discount: 15
  }
  // ... Add 7 more mock medicines here
];
