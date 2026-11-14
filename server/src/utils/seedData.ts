import { Restaurant } from '../models/Restaurant.js';
import { MenuItem } from '../models/MenuItem.js';

export const initialRestaurants = [
  {
    name: 'Trattoria Bella Roma',
    slug: 'trattoria-bella-roma',
    description:
      'Artisanal Neapolitan wood-fired pizzas, handmade pasta, and classic Italian antipasti using imported Italian ingredients.',
    cuisine: ['Italian', 'Pizza', 'Pasta', 'Mediterranean'],
    rating: 4.8,
    reviewCount: 342,
    deliveryTimeMin: 25,
    deliveryFee: 1.99,
    minOrder: 15.0,
    priceRange: '$$' as const,
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80',
    address: { street: '422 Piazza Blvd', city: 'Metro City', state: 'CA', zip: '90210' },
    isOpen: true,
    dietaryTags: ['Vegetarian Friendly', 'Gluten-Free Options', 'Halal Options'],
    featured: true,
    tags: ['Wood-fired', 'Top Rated', 'Handmade Pasta', 'Romantic'],
  },
  {
    name: 'Sakura Umami Japanese Kitchen',
    slug: 'sakura-umami-kitchen',
    description:
      'Masterfully crafted sushi, savory ramen bowls, crispy tempura, and modern izakaya style Japanese delicacies.',
    cuisine: ['Japanese', 'Sushi', 'Ramen', 'Asian'],
    rating: 4.9,
    reviewCount: 512,
    deliveryTimeMin: 30,
    deliveryFee: 2.49,
    minOrder: 20.0,
    priceRange: '$$$' as const,
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?auto=format&fit=crop&w=1600&q=80',
    address: { street: '88 Cherry Blossom Way', city: 'Metro City', state: 'CA', zip: '90211' },
    isOpen: true,
    dietaryTags: ['Gluten-Free Options', 'Pescatarian', 'Halal Options'],
    featured: true,
    tags: ['Fresh Sashimi', 'Rich Tonkotsu', 'Michelin Guide Mentioned'],
  },
  {
    name: 'El Fuego Cantina & Taqueria',
    slug: 'el-fuego-cantina',
    description:
      'Vibrant street tacos, sizzling fajitas, hand-pressed corn tortillas, and smoky artisanal salsas with bold Oaxacan flavors.',
    cuisine: ['Mexican', 'Tacos', 'Latin American'],
    rating: 4.7,
    reviewCount: 289,
    deliveryTimeMin: 20,
    deliveryFee: 0.99,
    minOrder: 12.0,
    priceRange: '$' as const,
    image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1600&q=80',
    address: { street: '710 Sol Del Fuego', city: 'Metro City', state: 'CA', zip: '90212' },
    isOpen: true,
    dietaryTags: ['Gluten-Free Friendly', 'Vegetarian Options', 'Halal Chicken'],
    featured: false,
    tags: ['Street Food', 'House Salsas', 'Fast Delivery'],
  },
  {
    name: 'Verde Pure Organic Bistro',
    slug: 'verde-pure-bistro',
    description:
      'Farm-to-table plant-based nourishing bowls, cold-pressed elixirs, organic salads, and vegan gluten-free gourmet plates.',
    cuisine: ['Vegan', 'Healthy', 'Organic', 'Bowls'],
    rating: 4.6,
    reviewCount: 195,
    deliveryTimeMin: 25,
    deliveryFee: 1.49,
    minOrder: 15.0,
    priceRange: '$$' as const,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1600&q=80',
    address: { street: '14 Botanical Park Rd', city: 'Metro City', state: 'CA', zip: '90213' },
    isOpen: true,
    dietaryTags: ['100% Vegan', 'Gluten-Free', 'Nut-Free Options', 'Organic'],
    featured: false,
    tags: ['Superfoods', 'Eco Packaging', 'Keto Friendly'],
  },
];

export const getMenuItemsForRestaurant = (restaurantId: any, slug: string) => {
  if (slug === 'trattoria-bella-roma') {
    return [
      {
        restaurantId,
        name: 'Truffle & Burrata Margherita',
        description:
          'San Marzano tomato coulis, fresh creamy burrata heart, black summer truffle carpaccio, and organic fresh basil.',
        price: 18.5,
        category: 'Wood-Fired Pizza',
        image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=600&q=80',
        popular: true,
        dietaryTags: ['Vegetarian'],
        spiceLevels: ['None', 'Mild (Chili Flakes)', 'Spicy Arrabbiata'],
        sizes: [
          { id: 'size-10', name: 'Personal 10"', priceDelta: 0 },
          { id: 'size-14', name: 'Classic 14"', priceDelta: 5.5 },
          { id: 'size-18', name: 'Family 18"', priceDelta: 10.0 },
        ],
        addOns: [
          { id: 'addon-truffle', name: 'Extra Shaved Truffle', price: 4.5 },
          { id: 'addon-prosciutto', name: 'Prosciutto di Parma', price: 3.5 },
          { id: 'addon-crust', name: 'Garlic Butter Stuffed Crust', price: 2.75 },
        ],
        calories: 840,
        preparationTimeMin: 18,
      },
      {
        restaurantId,
        name: 'Handcrafted Wild Boar Pappardelle',
        description:
          'Wide ribbon egg pasta slow-braised with Tuscan wild boar ragù, juniper berries, and 24-month aged Parmigiano-Reggiano.',
        price: 22.0,
        category: 'Handmade Pasta',
        image: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281699?auto=format&fit=crop&w=600&q=80',
        popular: true,
        dietaryTags: ['Chef Special'],
        spiceLevels: ['None', 'Mild', 'Medium'],
        sizes: [
          { id: 'size-reg', name: 'Regular Portion', priceDelta: 0 },
          { id: 'size-chef', name: 'Chef Hungry Portion (+40%)', priceDelta: 6.0 },
        ],
        addOns: [
          { id: 'addon-parm', name: 'Extra Parmigiano Reggiano', price: 2.0 },
          { id: 'addon-bread', name: 'Toasted Ciabatta Bread', price: 2.5 },
        ],
        calories: 780,
        preparationTimeMin: 20,
      },
      {
        restaurantId,
        name: 'Crispy Calamari Fritti',
        description:
          'Tender calamari rings flash-fried in seasoned semolina, served with Meyer lemon aioli and spicy marinara dipping sauce.',
        price: 13.5,
        category: 'Antipasti',
        image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=600&q=80',
        popular: false,
        dietaryTags: ['Pescatarian'],
        spiceLevels: ['Mild Marinara', 'Fiery Diablo Sauce'],
        sizes: [
          { id: 'size-single', name: 'Solo Plate', priceDelta: 0 },
          { id: 'size-share', name: 'Sharing Platter', priceDelta: 6.0 },
        ],
        addOns: [
          { id: 'addon-aioli', name: 'Extra Garlic Herb Aioli', price: 1.5 },
        ],
        calories: 520,
        preparationTimeMin: 12,
      },
      {
        restaurantId,
        name: 'Classic Espresso Tiramisu',
        description:
          'Savoiardi ladyfingers soaked in dark roast Illy espresso and Marsala, layered with whipped mascarpone cream and cocoa powder.',
        price: 8.5,
        category: 'Desserts',
        image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=600&q=80',
        popular: true,
        dietaryTags: ['Vegetarian'],
        spiceLevels: ['None'],
        sizes: [{ id: 'size-slice', name: 'Standard Slice', priceDelta: 0 }],
        addOns: [
          { id: 'addon-espresso', name: 'Side Double Espresso Shot', price: 3.0 },
          { id: 'addon-berries', name: 'Fresh Raspberry Puree', price: 1.75 },
        ],
        calories: 460,
        preparationTimeMin: 5,
      },
    ];
  } else if (slug === 'sakura-umami-kitchen') {
    return [
      {
        restaurantId,
        name: 'Black Garlic Tonkotsu Ramen',
        description:
          'Rich 24-hour pork bone broth enriched with roasted black garlic mayu, chashu pork belly, ajitsuke tamago egg, and bamboo shoots.',
        price: 17.5,
        category: 'Signature Ramen',
        image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80',
        popular: true,
        dietaryTags: ['Popular', 'Chef Recommended'],
        spiceLevels: ['Level 0 - Non-Spicy', 'Level 1 - Mild Spicy', 'Level 2 - Tokyo Fire', 'Level 3 - Ghost Chili Extreme'],
        sizes: [
          { id: 'size-reg', name: 'Standard Bowl', priceDelta: 0 },
          { id: 'size-large', name: 'Mega Bowl (Extra Broth & Noodles)', priceDelta: 4.0 },
        ],
        addOns: [
          { id: 'addon-chashu', name: 'Extra Braised Pork Chashu (2 pcs)', price: 3.5 },
          { id: 'addon-egg', name: 'Seasoned Soft-Boiled Egg', price: 1.75 },
          { id: 'addon-nori', name: 'Crispy Roasted Nori (4 pcs)', price: 1.25 },
        ],
        calories: 890,
        preparationTimeMin: 15,
      },
      {
        restaurantId,
        name: 'Flame-Torched Salmon Aburi Roll',
        description:
          'Inside out roll with snow crab & avocado, topped with king salmon, spicy kewpie mayo, unagi glaze, and tobiko pearls.',
        price: 19.0,
        category: 'Specialty Sushi',
        image: 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?auto=format&fit=crop&w=600&q=80',
        popular: true,
        dietaryTags: ['Pescatarian', 'Gluten-Free Option'],
        spiceLevels: ['Mild Sauce', 'Spicy Volcano Kick'],
        sizes: [
          { id: 'size-8pc', name: '8 Pieces', priceDelta: 0 },
          { id: 'size-12pc', name: '12 Pieces Deluxe', priceDelta: 7.0 },
        ],
        addOns: [
          { id: 'addon-avocado', name: 'Extra Avocado', price: 2.0 },
          { id: 'addon-ginger', name: 'Fresh Pickled Ginger & Wasabi', price: 1.0 },
        ],
        calories: 580,
        preparationTimeMin: 15,
      },
      {
        restaurantId,
        name: 'Spicy Edamame with Togarashi',
        description:
          'Steamed young soybean pods tossed in toasted sesame oil, minced garlic, sea salt, and Japanese seven-spice chili.',
        price: 7.5,
        category: 'Small Plates',
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
        popular: false,
        dietaryTags: ['Vegan', 'Gluten-Free'],
        spiceLevels: ['Mild Sea Salt', 'Spicy Garlic Chili', 'Extra Hot Togarashi'],
        sizes: [{ id: 'size-std', name: 'Full Bowl', priceDelta: 0 }],
        addOns: [],
        calories: 190,
        preparationTimeMin: 8,
      },
    ];
  } else if (slug === 'el-fuego-cantina') {
    return [
      {
        restaurantId,
        name: 'Birria QuesaTacos Trio',
        description:
          'Three griddled corn tortillas stuffed with slow-braised spiced beef, melted Oaxaca cheese, cilantro, onions, with hot consommé broth for dipping.',
        price: 16.0,
        category: 'Street Tacos',
        image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=600&q=80',
        popular: true,
        dietaryTags: ['Gluten-Free', 'Halal Beef'],
        spiceLevels: ['Mild Salsa Verde', 'Smoky Chipotle Medium', 'Fuego Habanero Fire'],
        sizes: [
          { id: 'size-3tacos', name: 'Trio (3 Tacos + Consommé)', priceDelta: 0 },
          { id: 'size-5tacos', name: 'Fiesta Pack (5 Tacos + Double Consommé)', priceDelta: 7.5 },
        ],
        addOns: [
          { id: 'addon-guac', name: 'Fresh Hass Guacamole', price: 3.0 },
          { id: 'addon-consomme', name: 'Extra Consommé Dip', price: 2.0 },
        ],
        calories: 760,
        preparationTimeMin: 14,
      },
      {
        restaurantId,
        name: 'Molcajete Guacamole & Warm Chips',
        description:
          'Hand-mashed Hass avocados, charred jalapeño, lime juice, red onion, cotija cheese, and sea salt with crispy house tortilla chips.',
        price: 9.5,
        category: 'Appetizers',
        image: 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=600&q=80',
        popular: true,
        dietaryTags: ['Vegetarian', 'Gluten-Free'],
        spiceLevels: ['Mild', 'Medium Jalapeño', 'Spicy Serrano'],
        sizes: [{ id: 'size-standard', name: 'Standard Molcajete', priceDelta: 0 }],
        addOns: [
          { id: 'addon-cotija', name: 'Extra Cotija Cheese', price: 1.5 },
        ],
        calories: 420,
        preparationTimeMin: 6,
      },
    ];
  } else {
    // Verde Pure Bistro
    return [
      {
        restaurantId,
        name: 'Golden Turmeric & Quinoa Power Bowl',
        description:
          'Warm organic quinoa, roasted sweet potatoes, spiced chickpeas, baby kale, pickled watermelon radish, and creamy tahini lemon dressing.',
        price: 15.5,
        category: 'Nourish Bowls',
        image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
        popular: true,
        dietaryTags: ['Vegan', 'Gluten-Free', 'Nut-Free', 'High Protein'],
        spiceLevels: ['Zero Spice', 'Mild Citrus Pepper', 'Spicy Ginger Sriracha'],
        sizes: [
          { id: 'size-bowl', name: 'Standard 24oz Bowl', priceDelta: 0 },
          { id: 'size-large-bowl', name: 'Power 32oz Bowl', priceDelta: 3.5 },
        ],
        addOns: [
          { id: 'addon-tofu', name: 'Crispy Baked Organic Tofu', price: 3.0 },
          { id: 'addon-avocado', name: 'Half Sliced Avocado', price: 2.5 },
          { id: 'addon-dressing', name: 'Extra Tahini Lemon Dressing', price: 1.25 },
        ],
        calories: 520,
        preparationTimeMin: 12,
      },
      {
        restaurantId,
        name: 'Green Goddess Cold-Pressed Juice',
        description:
          'Pressed green apple, cucumber, wild celery, lemon, ginger, and spirulina packed with living enzymes and antioxidants.',
        price: 7.95,
        category: 'Elixirs & Drinks',
        image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=600&q=80',
        popular: false,
        dietaryTags: ['Vegan', 'Raw', 'Gluten-Free'],
        spiceLevels: ['Standard Crisp', 'Extra Ginger Kick'],
        sizes: [
          { id: 'size-12oz', name: '12 oz Bottle', priceDelta: 0 },
          { id: 'size-16oz', name: '16 oz Bottle', priceDelta: 2.0 },
        ],
        addOns: [
          { id: 'addon-chia', name: 'Organic Chia Seeds Boost', price: 1.0 },
        ],
        calories: 140,
        preparationTimeMin: 5,
      },
    ];
  }
};

export const seedDatabaseIfEmpty = async () => {
  try {
    const count = await Restaurant.countDocuments();
    if (count > 0) {
      console.log(`[Seed] Database already has ${count} restaurants. Skipping initial seed.`);
      return;
    }

    console.log('[Seed] Seeding sample restaurants and detailed menus...');
    for (const r of initialRestaurants) {
      const createdRestaurant = await Restaurant.create(r);
      const items = getMenuItemsForRestaurant(createdRestaurant._id, r.slug);
      await MenuItem.insertMany(items);
    }
    console.log('[Seed] Sample restaurants and menu items successfully seeded!');
  } catch (err) {
    console.error('[Seed] Error seeding database:', err);
  }
};
