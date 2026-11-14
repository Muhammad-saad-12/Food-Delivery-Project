import { Restaurant } from '../models/Restaurant.js';
import { MenuItem } from '../models/MenuItem.js';

export const initialRestaurants = [
  {
    name: 'Kolachi Restaurant',
    slug: 'kolachi-restaurant',
    description:
      'Iconic Arabian Sea waterfront dining in Karachi, famed for charcoal-smoked Sajji, sizzling handi karahi, grilled Red Snapper, and succulent Hunzai kababs overlooking the ocean breeze.',
    cuisine: ['Pakistani', 'BBQ', 'Karahi', 'Seafood', 'Desi Grill'],
    rating: 4.9,
    reviewCount: 1240,
    deliveryTimeMin: 35,
    deliveryFee: 2.5,
    minOrder: 15.0,
    priceRange: '$$$' as const,
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1600&q=80',
    address: {
      street: 'Beach Avenue, Phase VIII, DHA',
      city: 'Karachi',
      areaOrLandmark: 'Do Darya / Clifton Sea View',
      state: 'Sindh',
      zip: '75500',
    },
    coordinates: {
      lat: 24.7645,
      lng: 67.0673,
    },
    isOpen: true,
    status: 'active' as const,
    vendorPhone: '0300-9281744',
    vendorEmail: 'orders@kolachirestaurant.pk',
    dietaryTags: ['100% Halal Certified', 'Family Dining', 'Seafood Special', 'Ocean Waterfront'],
    featured: true,
    tags: ['Do Darya Waterfront', 'Charcoal BBQ', 'Ocean View', 'Top Rated Karachi', 'Sajji Special'],
  },
  {
    name: 'Butt Karahi & BBQ',
    slug: 'butt-karahi-bbq',
    description:
      'The undisputed culinary landmark of Lahore. World-famous organic desi butter chicken karahi, tender mutton Shinwari, and melt-in-the-mouth seekh kebabs cooked live in heavy cast-iron woks.',
    cuisine: ['Lahori Desi', 'Mutton Karahi', 'Shinwari', 'BBQ', 'Desi Ghee'],
    rating: 4.8,
    reviewCount: 980,
    deliveryTimeMin: 30,
    deliveryFee: 1.99,
    minOrder: 12.0,
    priceRange: '$$' as const,
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80',
    address: {
      street: 'Lakshmi Chowk, McLeod Road',
      city: 'Lahore',
      areaOrLandmark: 'Lakshmi Chowk / Food Street',
      state: 'Punjab',
      zip: '54000',
    },
    coordinates: {
      lat: 31.5657,
      lng: 74.3242,
    },
    isOpen: true,
    status: 'active' as const,
    vendorPhone: '0321-4478190',
    vendorEmail: 'info@buttkarahilahore.pk',
    dietaryTags: ['100% Halal Certified', 'Pure Desi Ghee', 'Fresh Mutton', 'Heritage Recipe'],
    featured: true,
    tags: ['Lakshmi Chowk Legend', 'Desi Makhan Karahi', 'Midnight Food Street', 'Authentic Taste'],
  },
  {
    name: 'Monal Islamabad',
    slug: 'monal-islamabad',
    description:
      'Perched high in the Margalla Hills overlooking the serene capital city. Renowned for royal Mughlai handis, Peshawari chapli kebabs, sizzling BBQ platters, and panoramic mountain breezes.',
    cuisine: ['Pakistani', 'Continental', 'BBQ Platter', 'Mughlai', 'Buffet'],
    rating: 4.9,
    reviewCount: 1450,
    deliveryTimeMin: 40,
    deliveryFee: 2.99,
    minOrder: 18.0,
    priceRange: '$$$' as const,
    image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=800&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1600&q=80',
    address: {
      street: 'Daman-e-Koh, Margalla Hills Road',
      city: 'Islamabad',
      areaOrLandmark: 'Margalla Hills / Pir Sohawa',
      state: 'Federal Capital',
      zip: '44000',
    },
    coordinates: {
      lat: 33.7439,
      lng: 73.056,
    },
    isOpen: true,
    status: 'active' as const,
    vendorPhone: '0300-8541920',
    vendorEmail: 'reservations@themonal.com',
    dietaryTags: ['100% Halal Certified', 'Scenic Dining', 'Executive Platters', 'Organic Spices'],
    featured: true,
    tags: ['Margalla Hills View', 'Royal Mughlai', 'Family Banquets', 'Capital Landmark'],
  },
  {
    name: 'Haveli Restaurant',
    slug: 'haveli-restaurant',
    description:
      'Set inside a historic restored haveli facing the illuminated domes of Badshahi Mosque. Serving slow-cooked beef nihari with rich bone marrow (Nalli), shahi haleem, and traditional Lahori breakfast.',
    cuisine: ['Traditional Lahori', 'Desi Ghee', 'Nihari', 'Haleem', 'Mughlai'],
    rating: 4.8,
    reviewCount: 870,
    deliveryTimeMin: 30,
    deliveryFee: 1.99,
    minOrder: 15.0,
    priceRange: '$$$' as const,
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1600&q=80',
    address: {
      street: '2170-A Fort Road Food Street, Shahi Mohalla',
      city: 'Lahore',
      areaOrLandmark: 'Badshahi Mosque View / Walled City',
      state: 'Punjab',
      zip: '54000',
    },
    coordinates: {
      lat: 31.588,
      lng: 74.3103,
    },
    isOpen: true,
    status: 'active' as const,
    vendorPhone: '0300-4720911',
    vendorEmail: 'contact@havelirestaurant.com',
    dietaryTags: ['100% Halal Certified', 'Heritage Recipe', 'Slow-Cooked', 'Old Lahore Nostalgia'],
    featured: true,
    tags: ['Badshahi Mosque View', 'Mughal Haveli', 'Authentic Nihari', 'Food Street Heritage'],
  },
  {
    name: 'Student Biryani',
    slug: 'student-biryani',
    description:
      'The undisputed king of Karachi Street food since 1969. Signature golden aromatic basmati rice layered with spicy saffron marinated chicken, roasted potatoes (aloo), and crispy fried onions.',
    cuisine: ['Biryani', 'Karachi Street Food', 'Zarda', 'Kebab', 'Desi Fast Food'],
    rating: 4.7,
    reviewCount: 2100,
    deliveryTimeMin: 20,
    deliveryFee: 0.99,
    minOrder: 8.0,
    priceRange: '$' as const,
    image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=800&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=1600&q=80',
    address: {
      street: 'Mansfield Street, Saddar',
      city: 'Karachi',
      areaOrLandmark: 'Saddar / Burns Road',
      state: 'Sindh',
      zip: '74400',
    },
    coordinates: {
      lat: 24.8569,
      lng: 67.0251,
    },
    isOpen: true,
    status: 'active' as const,
    vendorPhone: '0300-1112233',
    vendorEmail: 'delivery@studentbiryani.com',
    dietaryTags: ['100% Halal Certified', 'Value Meal', 'Iconic Street Food', 'Fast Prep'],
    featured: false,
    tags: ['Original Saddar Recipe', 'Karachi Biryani King', 'Famous Since 1969', 'Spicy Dum Biryani'],
  },
];

export const getMenuItemsForRestaurant = (restaurantId: any, slug: string) => {
  if (slug === 'kolachi-restaurant') {
    return [
      {
        restaurantId,
        name: 'Mutton Shinwari Karahi',
        description:
          'Prime cuts of tender mutton simmered in animal fat, fresh crushed tomatoes, green chilies, and black pepper in a traditional cast-iron wok. No artificial masala.',
        price: 24.5,
        category: 'Signature Karahi',
        image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80',
        popular: true,
        dietaryTags: ['Chef Recommendation', '100% Halal Mutton'],
        spiceLevels: ['Mild Desi Herb', 'Medium Desi Mirch', 'Spicy Lahori Kick', 'Extremely Spicy Ghost Pepper'],
        sizes: [
          { id: 'size-half-kg', name: 'Half KG (1-2 persons)', priceDelta: 0 },
          { id: 'size-full-kg', name: 'Full 1 KG (3-4 persons)', priceDelta: 18.0 },
        ],
        addOns: [
          { id: 'addon-roghni-naan', name: 'Hot Sesame Roghni Naan', price: 1.5 },
          { id: 'addon-garlic-naan', name: 'Garlic Butter Naan', price: 1.75 },
          { id: 'addon-desi-butter', name: 'Extra Desi Butter Melting Dollop', price: 2.0 },
          { id: 'addon-zeera-raita', name: 'Chilled Zeera Raita Bowl', price: 1.25 },
        ],
        calories: 890,
        preparationTimeMin: 25,
      },
      {
        restaurantId,
        name: 'Peshawari Chapli Kebab Feast',
        description:
          'Hand-minced prime beef patties infused with crushed dried pomegranate seeds (anardana), coriander seeds, chopped scallions, and fried to crispy golden perfection.',
        price: 16.0,
        category: 'Desi Charcoal BBQ',
        image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=800&q=80',
        popular: true,
        dietaryTags: ['Khyber Special', 'Gluten-Free Option'],
        spiceLevels: ['Traditional Peshawari', 'Extra Crushed Chilies'],
        sizes: [
          { id: 'size-2-patties', name: '2 Large Patties Combo', priceDelta: 0 },
          { id: 'size-4-patties', name: '4 Large Patties Feast', priceDelta: 9.0 },
        ],
        addOns: [
          { id: 'addon-egg-topper', name: 'Fried Farm Egg on Top', price: 1.0 },
          { id: 'addon-podina-chutney', name: 'Tangy Mint & Podina Chutney', price: 0.75 },
          { id: 'addon-tandoori-roti', name: 'Crisp Tandoori Roti (2 pcs)', price: 1.0 },
        ],
        calories: 720,
        preparationTimeMin: 18,
      },
      {
        restaurantId,
        name: 'Charcoal Smoked Chicken Sajji',
        description:
          'Whole chicken marinated solely in coarse rock salt and fresh lemon juice, slow-roasted over burning charcoals and served over fragrant basmati rice.',
        price: 18.5,
        category: 'Balochi Specialties',
        image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
        popular: true,
        dietaryTags: ['Balochi Heritage', 'High Protein'],
        spiceLevels: ['Original Rock Salt & Lemon', 'Chatpata Sajji Masala'],
        sizes: [
          { id: 'size-half-sajji', name: 'Half Chicken Sajji', priceDelta: 0 },
          { id: 'size-full-sajji', name: 'Whole Chicken Sajji with Rice', priceDelta: 10.0 },
        ],
        addOns: [
          { id: 'addon-extra-sajji-rice', name: 'Spiced Fragrant Basmati Rice', price: 3.0 },
          { id: 'addon-kachumber', name: 'Fresh Kachumber Onion Salad', price: 1.0 },
        ],
        calories: 950,
        preparationTimeMin: 22,
      },
      {
        restaurantId,
        name: 'Coastal Grilled Red Snapper',
        description:
          'Fresh catch from the Arabian Sea marinated in tamarind paste, crushed red chilies, garlic, and grilled whole over an open charcoal brazier.',
        price: 26.0,
        category: 'Karachi Coastal Seafood',
        image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80',
        popular: false,
        dietaryTags: ['Fresh Seafood', 'Omega-3 Rich'],
        spiceLevels: ['Mild Lemon Butter', 'Spicy Coastal Tarka'],
        sizes: [
          { id: 'size-medium-fish', name: 'Medium Snapper (800g)', priceDelta: 0 },
          { id: 'size-large-fish', name: 'Catch of the Day Large (1.2kg)', priceDelta: 12.0 },
        ],
        addOns: [
          { id: 'addon-garlic-butter-dip', name: 'Warm Garlic Butter Dip', price: 1.5 },
          { id: 'addon-lemon-naan', name: 'Charred Naan', price: 1.25 },
        ],
        calories: 610,
        preparationTimeMin: 25,
      },
      {
        restaurantId,
        name: 'Special Doodh Patti Chai',
        description:
          'Strong, aromatic blend of green cardamom, saffron threads, and tea leaves simmered exclusively in thick, unadulterated buffalo milk.',
        price: 3.5,
        category: 'Hot Beverages',
        image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80',
        popular: true,
        dietaryTags: ['Vegetarian', 'Traditional Brew'],
        spiceLevels: ['Standard Cardamom', 'Extra Saffron & Ginger'],
        sizes: [
          { id: 'size-single-cup', name: 'Clay Matka Cup', priceDelta: 0 },
          { id: 'size-kettle', name: 'Sharing Kettle (for 2-3)', priceDelta: 3.5 },
        ],
        addOns: [
          { id: 'addon-gurr', name: 'Organic Peshawari Gurr (Jaggery)', price: 0.5 },
          { id: 'addon-malai', name: 'Extra Layer of Fresh Malai', price: 0.75 },
        ],
        calories: 180,
        preparationTimeMin: 10,
      },
      {
        restaurantId,
        name: 'Thick Mango Lassi',
        description:
          'Churned thick curd yogurt lassi blended with natural sweet Pakistani Sindhri mango pulp and crushed green pistachios.',
        price: 4.5,
        category: 'Cold Beverages',
        image: 'https://images.unsplash.com/photo-1528498033373-3c6c08e93d51?auto=format&fit=crop&w=800&q=80',
        popular: true,
        dietaryTags: ['Vegetarian', 'Probiotic'],
        spiceLevels: ['Classic Sweet', 'Extra Chilled'],
        sizes: [
          { id: 'size-glass-14oz', name: 'Tall Glass 14 oz', priceDelta: 0 },
          { id: 'size-jug-24oz', name: 'Jumbo Mug 24 oz', priceDelta: 2.5 },
        ],
        addOns: [
          { id: 'addon-pista-badam', name: 'Crushed Almonds & Pistachio Garnish', price: 1.0 },
        ],
        calories: 260,
        preparationTimeMin: 6,
      },
    ];
  } else if (slug === 'butt-karahi-bbq') {
    return [
      {
        restaurantId,
        name: 'Butt Special Mutton Shinwari Karahi (Desi Makhan)',
        description:
          'The iconic Lakshmi Chowk recipe. Mutton braised tender in pure country butter (makhan), juicy vine tomatoes, green chilies, and julienned ginger in a blistering karahi wok.',
        price: 25.0,
        category: 'Lakshmi Chowk Karahi',
        image: 'https://images.unsplash.com/photo-1545247181-516773cae754?auto=format&fit=crop&w=800&q=80',
        popular: true,
        dietaryTags: ['Lahori Legend', 'Pure Desi Butter'],
        spiceLevels: ['Mild Desi Herb', 'Medium Desi Mirch', 'Spicy Lahori Kick', 'Extremely Spicy Ghost Pepper'],
        sizes: [
          { id: 'size-half-kg', name: 'Half KG Handi', priceDelta: 0 },
          { id: 'size-full-kg', name: 'Full 1 KG Handi', priceDelta: 19.0 },
        ],
        addOns: [
          { id: 'addon-makhan-cake', name: 'Extra Cube of Butter Melting on Top', price: 2.0 },
          { id: 'addon-roghni-naan', name: 'Crisp Sesame Roghni Naan', price: 1.5 },
          { id: 'addon-garlic-naan', name: 'Garlic Desi Butter Naan', price: 1.75 },
          { id: 'addon-raita-salad', name: 'Mint Raita & Fresh Onion Slices', price: 1.25 },
        ],
        calories: 920,
        preparationTimeMin: 25,
      },
      {
        restaurantId,
        name: 'Desi Ghee Chicken Karahi',
        description:
          'Farm-fresh bone-in chicken braised in aromatic golden desi ghee, whole black peppercorns, roasted cumin, and red chili flakes.',
        price: 15.5,
        category: 'Lakshmi Chowk Karahi',
        image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80',
        popular: true,
        dietaryTags: ['Pure Desi Ghee', '100% Halal Chicken'],
        spiceLevels: ['Medium Desi Mirch', 'Spicy Lahori Kick', 'Teekha Ghost Pepper'],
        sizes: [
          { id: 'size-half-chicken', name: 'Half Chicken (500g)', priceDelta: 0 },
          { id: 'size-full-chicken', name: 'Full Chicken (1kg)', priceDelta: 10.0 },
        ],
        addOns: [
          { id: 'addon-tandoori-roti', name: 'Tandoori Roti (2 pcs)', price: 1.0 },
          { id: 'addon-roghni-naan', name: 'Roghni Naan', price: 1.5 },
        ],
        calories: 780,
        preparationTimeMin: 20,
      },
      {
        restaurantId,
        name: 'Special Lahori Haleem',
        description:
          'Slow-cooked overnight blend of seven ancient grains, lentils, and shredded prime beef, pounded into a silk-like texture and topped with sizzling golden onion tarka.',
        price: 12.0,
        category: 'Slow-Cooked Specialties',
        image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80',
        popular: true,
        dietaryTags: ['Heritage Recipe', 'Slow-Simmered'],
        spiceLevels: ['Mild Aromatic', 'Spicy Lahori Tarka'],
        sizes: [
          { id: 'size-single-bowl', name: 'Deep Bowl Portion', priceDelta: 0 },
          { id: 'size-family-handi', name: 'Family Handi (3-4 persons)', priceDelta: 8.5 },
        ],
        addOns: [
          { id: 'addon-tarka-birista', name: 'Extra Crispy Fried Onion (Birista)', price: 1.0 },
          { id: 'addon-lemon-ginger', name: 'Fresh Cut Ginger & Lemon Wedges', price: 0.75 },
          { id: 'addon-khameeri-roti', name: 'Soft Khameeri Roti (2 pcs)', price: 1.5 },
        ],
        calories: 680,
        preparationTimeMin: 15,
      },
      {
        restaurantId,
        name: 'Beef Bihari Tikka Kebab',
        description:
          'Thin ribbons of undercut beef marinated for 24 hours in raw papaya, roasted whole spices, and mustard oil, grilled gently over charcoal embers.',
        price: 14.5,
        category: 'Desi Charcoal BBQ',
        image: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=800&q=80',
        popular: true,
        dietaryTags: ['Chef Special', 'Melt In Mouth'],
        spiceLevels: ['Authentic Bihari Spice', 'Extra Red Chili Kick'],
        sizes: [
          { id: 'size-regular-plate', name: 'Single Skewer Platter', priceDelta: 0 },
          { id: 'size-double-plate', name: 'Double Skewer Platter', priceDelta: 7.5 },
        ],
        addOns: [
          { id: 'addon-puri-paratha', name: 'Crispy Fried Puri Paratha', price: 1.5 },
          { id: 'addon-imli-chutney', name: 'Sweet & Tangy Imli Chutney', price: 0.75 },
        ],
        calories: 590,
        preparationTimeMin: 18,
      },
      {
        restaurantId,
        name: 'Shahi Khoya Kheer Clay Matka',
        description:
          'Rich, thick rice pudding simmered with pure milk solids (khoya), saffron, kewra water, and garnished with roasted almonds and edible silver foil.',
        price: 5.0,
        category: 'Traditional Sweets',
        image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80',
        popular: true,
        dietaryTags: ['Vegetarian', 'Desi Sweet'],
        spiceLevels: ['Cardamom Infused'],
        sizes: [
          { id: 'size-matka-single', name: 'Single Clay Matka', priceDelta: 0 },
          { id: 'size-matka-family', name: 'Family Sharing Bowl', priceDelta: 6.0 },
        ],
        addOns: [
          { id: 'addon-pista', name: 'Extra Chopped Pistachios', price: 1.0 },
        ],
        calories: 340,
        preparationTimeMin: 5,
      },
    ];
  } else if (slug === 'monal-islamabad') {
    return [
      {
        restaurantId,
        name: 'Monal Royal Mughlai Mutton Handi',
        description:
          'Boneless cubes of tender mutton cooked gently in a clay handi with rich cashew nut gravy, fresh cream, fenugreek leaves, and aromatic garam masala.',
        price: 26.5,
        category: 'Royal Mughlai Curries',
        image: 'https://images.unsplash.com/photo-1545247181-516773cae754?auto=format&fit=crop&w=800&q=80',
        popular: true,
        dietaryTags: ['Chef Special', 'Mild & Rich'],
        spiceLevels: ['Mild Creamy', 'Medium Mughlai', 'Spicy Royal'],
        sizes: [
          { id: 'size-half-handi', name: 'Half Handi (1-2 persons)', priceDelta: 0 },
          { id: 'size-full-handi', name: 'Full Handi (3-4 persons)', priceDelta: 20.0 },
        ],
        addOns: [
          { id: 'addon-garlic-naan', name: 'Garlic Naan', price: 1.75 },
          { id: 'addon-roghni-naan', name: 'Sesame Roghni Naan', price: 1.5 },
          { id: 'addon-zeera-raita', name: 'Zeera Raita', price: 1.25 },
        ],
        calories: 860,
        preparationTimeMin: 25,
      },
      {
        restaurantId,
        name: 'Peshawari Chapli Kebab',
        description:
          'Authentic Frontier-style coarse minced beef patties spiced with carom seeds, pomegranate bits, crushed chilies, and fried to a sizzling crisp crust.',
        price: 15.5,
        category: 'Frontier Grills',
        image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=800&q=80',
        popular: true,
        dietaryTags: ['Pakhtunkhwa Special'],
        spiceLevels: ['Traditional Peshawari', 'Extra Crushed Chilies'],
        sizes: [
          { id: 'size-2-kebabs', name: '2 Large Patties Combo', priceDelta: 0 },
          { id: 'size-4-kebabs', name: '4 Large Patties Feast', priceDelta: 8.5 },
        ],
        addOns: [
          { id: 'addon-fried-egg', name: 'Sunny Side Egg on Top', price: 1.0 },
          { id: 'addon-mint-chutney', name: 'Peshawari Mint Chutney', price: 0.75 },
        ],
        calories: 740,
        preparationTimeMin: 18,
      },
      {
        restaurantId,
        name: 'Margalla BBQ Mixed Grill Platter',
        description:
          'An extravagant barbecue assortment: tender chicken malai tikka, spicy beef seekh kebabs, mutton chops, and fish tikka, served on a sizzling hot stone bed.',
        price: 28.0,
        category: 'Frontier Grills',
        image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
        popular: true,
        dietaryTags: ['Feast For Two', 'High Protein'],
        spiceLevels: ['Medium Barbecue', 'Spicy Charred'],
        sizes: [
          { id: 'size-platter-reg', name: 'Platter for Two', priceDelta: 0 },
          { id: 'size-platter-grand', name: 'Grand Emperor Platter (4 persons)', priceDelta: 18.0 },
        ],
        addOns: [
          { id: 'addon-naan-basket', name: 'Assorted Naan Basket (3 pcs)', price: 3.5 },
          { id: 'addon-hummus-raita', name: 'Duo of Zeera Raita & Garlic Dip', price: 2.0 },
        ],
        calories: 1150,
        preparationTimeMin: 25,
      },
      {
        restaurantId,
        name: 'Afghani Kabuli Pulao',
        description:
          'Long-grain sella basmati rice simmered in rich lamb broth, studded with tender braised lamb shank, caramelized carrots, and sweet golden sultanas.',
        price: 18.0,
        category: 'Rice & Pulao',
        image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
        popular: false,
        dietaryTags: ['Heritage Recipe', 'Nutty & Sweet Notes'],
        spiceLevels: ['Mild Aromatic', 'Cardamom & Clove Infused'],
        sizes: [
          { id: 'size-pulao-single', name: 'Single Shank Portion', priceDelta: 0 },
          { id: 'size-pulao-double', name: 'Double Shank Banquet', priceDelta: 9.0 },
        ],
        addOns: [
          { id: 'addon-fried-raisins', name: 'Extra Toasted Almonds & Raisins', price: 1.5 },
          { id: 'addon-raita', name: 'Cucumber Mint Raita', price: 1.25 },
        ],
        calories: 820,
        preparationTimeMin: 20,
      },
      {
        restaurantId,
        name: 'Special Doodh Patti Chai',
        description:
          'Cardamom-scented milk tea simmered with pure cream and saffron, served in earthen cups at the crisp mountain ridge.',
        price: 3.5,
        category: 'Hot Beverages',
        image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80',
        popular: true,
        dietaryTags: ['Vegetarian'],
        spiceLevels: ['Standard Cardamom', 'Spiced Cinnamon & Saffron'],
        sizes: [
          { id: 'size-cup', name: 'Clay Cup', priceDelta: 0 },
          { id: 'size-pot', name: 'Mountain Pot (3 cups)', priceDelta: 4.0 },
        ],
        addOns: [
          { id: 'addon-gurr', name: 'Natural Gurr', price: 0.5 },
        ],
        calories: 190,
        preparationTimeMin: 8,
      },
    ];
  } else if (slug === 'haveli-restaurant') {
    return [
      {
        restaurantId,
        name: 'Royal Beef Nihari with Bone Marrow (Nalli)',
        description:
          'Slow-simmered beef shanks in an aromatic roux-thickened reduction for 10 hours. Served with roasted bone marrow (Nalli), ginger juliennes, green chilies, and fresh lemon.',
        price: 19.5,
        category: 'Old Lahore Nihari',
        image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
        popular: true,
        dietaryTags: ['Walled City Icon', 'Slow-Simmered 10 Hrs'],
        spiceLevels: ['Classic Nihari Spice', 'Extra Tarka Teekha', 'Spicy Maghaz Special'],
        sizes: [
          { id: 'size-single-nihari', name: 'Standard Bowl with Shank', priceDelta: 0 },
          { id: 'size-nalli-special', name: 'Special Nalli Nihari (Double Marrow Bones)', priceDelta: 6.5 },
        ],
        addOns: [
          { id: 'addon-extra-nalli', name: 'Additional Roasted Bone Marrow (Nalli)', price: 3.0 },
          { id: 'addon-maghaz', name: 'Fried Brain (Maghaz) Portion', price: 4.0 },
          { id: 'addon-khameeri-kulcha', name: 'Hot Sesame Kulcha (2 pcs)', price: 1.5 },
          { id: 'addon-garnishing-plate', name: 'Extra Ginger, Chilies & Lemon Set', price: 0.75 },
        ],
        calories: 980,
        preparationTimeMin: 15,
      },
      {
        restaurantId,
        name: 'Special Lahori Haleem',
        description:
          'Velvety stew of beef, cracked wheat, barley, and mixed lentils slow-cooked to shredded tenderness, garnished with golden fried onions, julienned ginger, and chaat masala.',
        price: 13.0,
        category: 'Old Lahore Specialties',
        image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80',
        popular: true,
        dietaryTags: ['High Fiber', 'Heritage Recipe'],
        spiceLevels: ['Medium Masala', 'Extra Teekha Tarka'],
        sizes: [
          { id: 'size-single', name: 'Regular Deep Bowl', priceDelta: 0 },
          { id: 'size-handi', name: 'Royal Handi (for 3)', priceDelta: 8.0 },
        ],
        addOns: [
          { id: 'addon-fried-onions', name: 'Crunchy Birista Fried Onions', price: 1.0 },
          { id: 'addon-naan', name: 'Garlic Naan', price: 1.75 },
        ],
        calories: 670,
        preparationTimeMin: 12,
      },
      {
        restaurantId,
        name: 'Traditional Halwa Puri Thali with Channay',
        description:
          'The ultimate weekend Lahori breakfast: hot fluffy deep-fried puris served with spicy Lahore channay (chickpea curry), tangy aloo bhujia, and rich sooji halwa.',
        price: 9.5,
        category: 'Old Lahore Breakfast',
        image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
        popular: true,
        dietaryTags: ['Lahori Breakfast Legend', 'Vegetarian Friendly'],
        spiceLevels: ['Classic Channay Masala', 'Extra Achaari Punch'],
        sizes: [
          { id: 'size-thali-3', name: '3 Puris with Halwa & Channay', priceDelta: 0 },
          { id: 'size-thali-5', name: '5 Puris Feast with Extra Channay', priceDelta: 4.5 },
        ],
        addOns: [
          { id: 'addon-extra-puri', name: 'Extra Hot Puri (2 pcs)', price: 1.5 },
          { id: 'addon-achaar', name: 'Mixed Lahori Mango & Lime Achaar', price: 0.75 },
        ],
        calories: 780,
        preparationTimeMin: 15,
      },
      {
        restaurantId,
        name: 'Mutton Shinwari Karahi',
        description:
          'Fresh lamb cooked with diced tomatoes, split green chilies, and salt, finished with a generous scattering of fresh coriander and ginger.',
        price: 24.0,
        category: 'Heritage Karahi',
        image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80',
        popular: false,
        dietaryTags: ['Pure Desi Makhan'],
        spiceLevels: ['Mild Desi Herb', 'Medium Desi Mirch', 'Spicy Lahori Kick'],
        sizes: [
          { id: 'size-half-kg', name: 'Half KG Handi', priceDelta: 0 },
          { id: 'size-full-kg', name: 'Full 1 KG Handi', priceDelta: 18.0 },
        ],
        addOns: [
          { id: 'addon-roghni-naan', name: 'Roghni Naan', price: 1.5 },
          { id: 'addon-raita', name: 'Zeera Raita', price: 1.25 },
        ],
        calories: 890,
        preparationTimeMin: 25,
      },
      {
        restaurantId,
        name: 'Khoya Kheer Matka with Pistachios',
        description:
          'Chilled cardamom-scented slow-cooked rice kheer prepared with dense khoya, crushed green pistachios, and silver leaf in a traditional earthen pot.',
        price: 4.5,
        category: 'Desserts',
        image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80',
        popular: true,
        dietaryTags: ['Vegetarian', 'Chilled Desi Sweet'],
        spiceLevels: ['Cardamom & Saffron'],
        sizes: [
          { id: 'size-matka', name: 'Single Clay Pot', priceDelta: 0 },
        ],
        addOns: [
          { id: 'addon-almonds', name: 'Extra Silver Vark & Almonds', price: 1.0 },
        ],
        calories: 320,
        preparationTimeMin: 5,
      },
    ];
  } else {
    // Student Biryani (slug === 'student-biryani' and default fallback)
    return [
      {
        restaurantId,
        name: 'Chicken Biryani (Karachi Special Dum)',
        description:
          'The authentic Student Biryani legend: fragrant aged long-grain basmati rice layered with spicy saffron marinated chicken, roasted masala aloo (potato), and caramelized onions.',
        price: 8.5,
        category: 'Iconic Dum Biryani',
        image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
        popular: true,
        dietaryTags: ['Bestseller Karachi', '100% Halal Chicken'],
        spiceLevels: ['Mild Aromatic', 'Authentic Karachi Masala', 'Extra Chatpata Teekha'],
        sizes: [
          { id: 'size-single-plate', name: 'Single Plate with 1 Chicken Piece & Aloo', priceDelta: 0 },
          { id: 'size-double-meat', name: 'Double Chicken & Double Aloo Plate', priceDelta: 3.5 },
          { id: 'size-family-pot', name: 'Family Handi Pot (4-5 persons)', priceDelta: 16.0 },
        ],
        addOns: [
          { id: 'addon-shami-kebab', name: 'Crispy Beef Shami Kebab (2 pcs)', price: 2.0 },
          { id: 'addon-zeera-raita', name: 'Chilled Zeera & Mint Raita', price: 1.0 },
          { id: 'addon-kachumber', name: 'Kachumber Salad (Cucumber, Tomato & Onion)', price: 0.75 },
          { id: 'addon-extra-aloo', name: 'Extra Spiced Masala Potato (Aloo)', price: 0.75 },
        ],
        calories: 760,
        preparationTimeMin: 12,
      },
      {
        restaurantId,
        name: 'Special Mutton Dum Biryani',
        description:
          'Tender bone-in mutton marinated in traditional Karachi spices, layered with golden saffron rice and steam-cooked in sealed deghs for hours.',
        price: 13.5,
        category: 'Iconic Dum Biryani',
        image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=800&q=80',
        popular: true,
        dietaryTags: ['Fresh Mutton', 'Heritage Dum Style'],
        spiceLevels: ['Authentic Karachi Masala', 'Extra Chatpata Teekha'],
        sizes: [
          { id: 'size-mutton-single', name: 'Single Plate (2 Mutton Pieces & Aloo)', priceDelta: 0 },
          { id: 'size-mutton-double', name: 'Special Feast (4 Mutton Pieces)', priceDelta: 5.5 },
        ],
        addOns: [
          { id: 'addon-shami', name: 'Shami Kebab (2 pcs)', price: 2.0 },
          { id: 'addon-raita', name: 'Zeera Raita', price: 1.0 },
        ],
        calories: 880,
        preparationTimeMin: 15,
      },
      {
        restaurantId,
        name: 'Chicken Tikka Chest Piece with Puri Paratha',
        description:
          'Succulent chicken breast piece marinated in fiery red tandoori masala and lemon, skewered and charred over open coals. Served with flaky deep-fried puri paratha.',
        price: 7.5,
        category: 'Street BBQ',
        image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=800&q=80',
        popular: true,
        dietaryTags: ['Charcoal Grilled', 'High Protein'],
        spiceLevels: ['Medium Spiced', 'Extra Teekha Tandoori'],
        sizes: [
          { id: 'size-single-chest', name: 'Single Chest Piece with 1 Paratha', priceDelta: 0 },
          { id: 'size-combo', name: 'Chest + Leg Piece Combo with 2 Parathas', priceDelta: 6.0 },
        ],
        addOns: [
          { id: 'addon-puri-paratha', name: 'Extra Crispy Puri Paratha', price: 1.25 },
          { id: 'addon-imli-sauce', name: 'Special Imli Mint Chutney', price: 0.5 },
        ],
        calories: 640,
        preparationTimeMin: 18,
      },
      {
        restaurantId,
        name: 'Shahi Zarda with Khoya & Gulab Jamun',
        description:
          'Celebration basmati sweet rice cooked in fragrant saffron syrup and ghee, studded with soft mini gulab jamuns, raisins, almonds, and fresh khoya.',
        price: 4.5,
        category: 'Desi Desserts',
        image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80',
        popular: false,
        dietaryTags: ['Vegetarian', 'Karachi Wedding Sweet'],
        spiceLevels: ['Cardamom Scented'],
        sizes: [
          { id: 'size-zarda-cup', name: 'Single Plate Portion', priceDelta: 0 },
          { id: 'size-zarda-box', name: 'Family Sharing Box (500g)', priceDelta: 5.0 },
        ],
        addOns: [
          { id: 'addon-gulab-jamun', name: 'Extra Mini Gulab Jamuns (3 pcs)', price: 1.5 },
        ],
        calories: 420,
        preparationTimeMin: 5,
      },
      {
        restaurantId,
        name: 'Thick Churned Mango Lassi',
        description:
          'Rich, creamy chilled yogurt shake churned with fresh Pakistani Sindhri mango puree and crushed ice.',
        price: 3.5,
        category: 'Beverages',
        image: 'https://images.unsplash.com/photo-1528498033373-3c6c08e93d51?auto=format&fit=crop&w=800&q=80',
        popular: true,
        dietaryTags: ['Vegetarian', 'Chilled'],
        spiceLevels: ['Sweet Mango Bliss'],
        sizes: [
          { id: 'size-regular', name: 'Regular Glass 14 oz', priceDelta: 0 },
          { id: 'size-large', name: 'Jumbo Glass 22 oz', priceDelta: 1.75 },
        ],
        addOns: [
          { id: 'addon-pista-garnish', name: 'Crushed Pistachio Sprinkle', price: 0.75 },
        ],
        calories: 250,
        preparationTimeMin: 5,
      },
    ];
  }
};

export const seedDatabaseIfEmpty = async () => {
  try {
    // If previous mock data exists with western names, clear it to reseed with authentic Pakistani restaurants
    const legacyRestaurant = await Restaurant.findOne({
      slug: { $in: ['trattoria-bella-roma', 'sakura-umami-kitchen', 'el-fuego-cantina'] },
    });

    if (legacyRestaurant) {
      console.log('[Seed] Detected legacy western restaurants. Refreshing with authentic Pakistani restaurant dataset...');
      await Restaurant.deleteMany({});
      await MenuItem.deleteMany({});
    }

    const count = await Restaurant.countDocuments();
    if (count > 0) {
      console.log(`[Seed] Database already has ${count} restaurants. Skipping initial seed.`);
      return;
    }

    console.log('[Seed] Seeding authentic Pakistani restaurants and detailed menus...');
    for (const r of initialRestaurants) {
      const createdRestaurant = await Restaurant.create(r);
      const items = getMenuItemsForRestaurant(createdRestaurant._id, r.slug);
      await MenuItem.insertMany(items);
    }
    console.log('[Seed] Pakistani restaurants and menu items successfully seeded!');
  } catch (err) {
    console.error('[Seed] Error seeding database:', err);
  }
};
