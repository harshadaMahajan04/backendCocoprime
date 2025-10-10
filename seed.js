import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./models/Product.js"; // adjust path if needed

dotenv.config();

const productsSeed = [
  // 🌿 Cocopeat & Powder
  {id:1, title:"CocoPrime cocopeat Block-5kg", price:79, oldPrice:99, rating:4.8, images:["img/5kg/5.jpeg","img/5kg/5a.jpeg","img/5kg/5b.jpeg"], description:"High-quality cocopeat blocks ideal for supporting indoor and outdoor plants."},
  {id:2, title:"CocoPrime Coco peat block-1kg", price:499, oldPrice:599, rating:4.6, images:["img/1kg/1.jpeg","img/1kg/1a.jpeg","img/1kg/1b.jpeg"], description:"Premium quality coco peat block for gardening and soil enrichment."},
  {id:3, title:"CocoPrime cocopeat powder – 5kg", price:79, oldPrice:99, rating:4.7, images:["img/cocopowder5kg/p.jpeg","img/cocopowder5kg/p1.jpeg","img/cocopowder5kg/p2.jpeg","img/cocopowder5kg/p3.jpeg"], description:"Eco-friendly cocopeat powder perfect for all plants and soil enhancement."},
  {id:4, title:"Cocoprime cocopeat powder-10kg", price:79, oldPrice:99, rating:4.7, images:["img/cocopowder10kg/powder 10kg.jpeg","img/cocopowder10kg/WhatsApp Image 2025-09-30 at 21.37.16.jpeg","img/cocopowder10kg/WhatsApp Image 2025-09-30 at 21.37.20 (1).jpeg","img/cocopowder10kg/WhatsApp Image 2025-09-30 at 21.37.20.jpeg"], description:"Eco-friendly cocopeat powder perfect for all plants and soil enhancement."},

  // 🪴 1ft Coir Sticks
  {id:6, title:"Cocoprime coir stick 1ft (Set of 1)", price:79, oldPrice:99, rating:4.7, images:["img/coirstick/coir3.jpeg"], description:"Strong and eco-friendly coir stick for plant support."},
  {id:7, title:"Cocoprime coir stick 1ft (Set of 2)", price:158, oldPrice:198, rating:4.7, images:["img/coirstick/coir3.jpeg"], description:"Set of 2 coir sticks for plant support."},
  {id:8, title:"Cocoprime coir stick 1ft (Set of 4)", price:316, oldPrice:396, rating:4.7, images:["img/coirstick/coir4.jpeg"], description:"Set of 4 coir sticks for better plant support."},
  {id:9, title:"Cocoprime coir stick 1ft (Set of 5)", price:395, oldPrice:495, rating:4.7, images:["img/coirstick/coir4.jpeg"], description:"Set of 5 coir sticks for better plant support."},

  // 🪴 2ft Coir Sticks
  {id:10, title:"Cocoprime coir stick 2ft (Set of 1)", price:79, oldPrice:99, rating:4.7, images:["img/coirstick/coir3.jpeg"], description:"Strong and eco-friendly coir stick for plant support."},
  {id:11, title:"Cocoprime coir stick 2ft (Set of 2)", price:158, oldPrice:198, rating:4.7, images:["img/coirstick/coir2.jpeg"], description:"Set of 2 coir sticks for plant support."},
  {id:12, title:"Cocoprime coir stick 2ft (Set of 4)", price:316, oldPrice:396, rating:4.7, images:["img/coirstick/coir4.jpeg"], description:"Set of 4 coir sticks for better plant support."},
  {id:13, title:"Cocoprime coir stick 2ft (Set of 5)", price:395, oldPrice:495, rating:4.7, images:["img/coirstick/coir4.jpeg"], description:"Set of 5 coir sticks for better plant support."},

  // 🪴 3ft Coir Sticks
  {id:14, title:"Cocoprime coir stick 3ft (Set of 1)", price:79, oldPrice:99, rating:4.7, images:["img/coirstick/coir3.jpeg"], description:"Strong and eco-friendly coir stick for plant support."},
  {id:15, title:"Cocoprime coir stick 3ft (Set of 2)", price:158, oldPrice:198, rating:4.7, images:["img/coirstick/coir3.jpeg"], description:"Set of 2 coir sticks for plant support."},
  {id:16, title:"Cocoprime coir stick 3ft (Set of 4)", price:316, oldPrice:396, rating:4.7, images:["img/coirstick/coir3.jpeg"], description:"Set of 4 coir sticks for better plant support."},
  {id:17, title:"Cocoprime coir stick 3ft (Set of 5)", price:395, oldPrice:495, rating:4.7, images:["img/coirstick/coir3.jpeg"], description:"Set of 5 coir sticks for better plant support."},

  // 🪴 4ft Coir Sticks
  {id:18, title:"Cocoprime coir stick 4ft (Set of 1)", price:79, oldPrice:99, rating:4.7, images:["img/coirstick/coir4.jpeg"], description:"Strong and eco-friendly coir stick for plant support."},
  {id:19, title:"Cocoprime coir stick 4ft (Set of 2)", price:158, oldPrice:198, rating:4.7, images:["img/coirstick/coir4.jpeg"], description:"Set of 2 coir sticks for plant support."},
  {id:20, title:"Cocoprime coir stick 4ft (Set of 4)", price:316, oldPrice:396, rating:4.7, images:["img/coirstick/coir4.jpeg"], description:"Set of 4 coir sticks for better plant support."},
  {id:21, title:"Cocoprime coir stick 4ft (Set of 5)", price:395, oldPrice:495, rating:4.7, images:["img/coirstick/coir4.jpeg"], description:"Set of 5 coir sticks for better plant support."},

  // 🪴 5ft Coir Sticks
  {id:22, title:"Cocoprime coir stick 5ft (Set of 1)", price:79, oldPrice:99, rating:4.7, images:["img/coirstick/coir3.jpeg"], description:"Strong and eco-friendly coir stick for plant support."},
  {id:23, title:"Cocoprime coir stick 5ft (Set of 2)", price:158, oldPrice:198, rating:4.7, images:["img/coirstick/coir2.jpeg"], description:"Set of 2 coir sticks for plant support."},
  {id:24, title:"Cocoprime coir stick 5ft (Set of 4)", price:316, oldPrice:396, rating:4.7, images:["img/coirstick/coir4.jpeg"], description:"Set of 4 coir sticks for better plant support."},
  {id:25, title:"Cocoprime coir stick 5ft (Set of 5)", price:395, oldPrice:495, rating:4.7, images:["img/coirstick/coir4.jpeg"], description:"Set of 5 coir sticks for better plant support."}
];

// Map seed data to match Product schema
const mappedProducts = productsSeed.map(p => ({
  name: p.title,                  // title → name
  description: p.description,
  price: p.price,                 // use current price
  stock: 50,                      // default stock
  images: p.images,
   imageUrl: p.images[0], 
  ratings: {
    average: p.rating,
    count: 0
  },
  isActive: true
}));

// Connect to DB and insert
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

const seedProducts = async () => {
  try {
    await Product.deleteMany();       // optional: remove old products
    await Product.insertMany(mappedProducts);
    console.log("Products seeded successfully!");
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedProducts();
