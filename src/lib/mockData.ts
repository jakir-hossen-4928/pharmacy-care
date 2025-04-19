
import { Medicine } from "./types";

export const categories = [
  {
    id: "dilutions",
    name: "DILUTIONS & POTENCIES",
    subcategories: ["30 CH", "200 CH", "1M", "10M", "ADEL(PEKANA)", "R SERIES", "KENT SERIES", "SBL DROP"]
  },
  {
    id: "tinctures",
    name: "MOTHER TINCTURES",
    subcategories: ["Single", "Combinations", "RAX", "LOCAL (DESHI)"]
  },
  {
    id: "biochemics",
    name: "BIOCHEMICS",
    subcategories: ["Tablets", "Combinations", "HERBAMED HM SERIES"]
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
  },
  {
    id: "power",
    name: "POWER",
    subcategories: ["Capsules", "Liquid"]
  },
  {
    id: "syrup",
    name: "SYRUP/DROP & TABLET",
    subcategories: ["Cough", "Cold", "Pain"]
  },
  {
    id: "other",
    name: "OTHER PRODUCTS",
    subcategories: ["OTHERS DROP", "Supplements"]
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
  },
  {
    id: "4",
    name: "Adel 20",
    price: 580,
    category: "DILUTIONS & POTENCIES",
    description: "Specialized homeopathic remedy for overall wellness.",
    imageUrl: "https://lovable-uploads.s3.amazonaws.com/7f3fe22b-6695-4f65-a761-cb19edbf7da6.png",
    stock: 25,
    createdAt: new Date(),
    discount: 5
  },
  {
    id: "5",
    name: "Cri-Regen",
    price: 580,
    category: "DILUTIONS & POTENCIES",
    description: "Homeopathic remedy for rejuvenation and recovery.",
    imageUrl: "https://lovable-uploads.s3.amazonaws.com/7f3fe22b-6695-4f65-a761-cb19edbf7da6.png",
    stock: 15,
    createdAt: new Date(),
    discount: 5
  },
  {
    id: "6",
    name: "Belladonna Mother Tincture",
    price: 200,
    category: "MOTHER TINCTURES",
    description: "Used for fever and inflammatory conditions.",
    imageUrl: "https://lovable-uploads.s3.amazonaws.com/7f3fe22b-6695-4f65-a761-cb19edbf7da6.png",
    stock: 40,
    createdAt: new Date(),
  },
  {
    id: "7",
    name: "Kali Phos",
    price: 160,
    category: "BIOCHEMICS",
    description: "For nervous exhaustion and stress management.",
    imageUrl: "https://lovable-uploads.s3.amazonaws.com/7f3fe22b-6695-4f65-a761-cb19edbf7da6.png",
    stock: 35,
    createdAt: new Date(),
    discount: 8
  },
  {
    id: "8",
    name: "Silica Complex",
    price: 250,
    category: "TABLETS",
    description: "Supports skin, hair, and nail health.",
    imageUrl: "https://lovable-uploads.s3.amazonaws.com/7f3fe22b-6695-4f65-a761-cb19edbf7da6.png",
    stock: 20,
    createdAt: new Date(),
  },
  {
    id: "9",
    name: "Herbal Hair Oil",
    price: 320,
    category: "COSMETICS ITEMS",
    description: "Nourishing oil for hair growth and care.",
    imageUrl: "https://lovable-uploads.s3.amazonaws.com/7f3fe22b-6695-4f65-a761-cb19edbf7da6.png",
    stock: 50,
    createdAt: new Date(),
    discount: 12
  },
  {
    id: "10",
    name: "Immunity Power Capsules",
    price: 450,
    category: "POWER",
    description: "Boosts immune system function naturally.",
    imageUrl: "https://lovable-uploads.s3.amazonaws.com/7f3fe22b-6695-4f65-a761-cb19edbf7da6.png",
    stock: 30,
    createdAt: new Date(),
  },
  {
    id: "11",
    name: "Cough Relief Syrup",
    price: 180,
    category: "SYRUP/DROP & TABLET",
    description: "Natural relief from cough symptoms.",
    imageUrl: "https://lovable-uploads.s3.amazonaws.com/7f3fe22b-6695-4f65-a761-cb19edbf7da6.png",
    stock: 45,
    createdAt: new Date(),
    discount: 5
  },
  {
    id: "12",
    name: "Multivitamin Supplements",
    price: 280,
    category: "OTHER PRODUCTS",
    description: "Complete daily nutrition support.",
    imageUrl: "https://lovable-uploads.s3.amazonaws.com/7f3fe22b-6695-4f65-a761-cb19edbf7da6.png",
    stock: 50,
    createdAt: new Date(),
  }
];
