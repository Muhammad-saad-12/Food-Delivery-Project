import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { Restaurant } from '../models/Restaurant.js';
import { MenuItem } from '../models/MenuItem.js';
import { initialRestaurants, getMenuItemsForRestaurant } from '../utils/seedData.js';

export const aiRouter = Router();

// Retrieve combined catalog for AI reasoning
async function getCatalog(restaurantId?: string) {
  const isConnected = mongoose.connection.readyState === 1;

  if (isConnected) {
    const filter = restaurantId && mongoose.isValidObjectId(restaurantId) ? { _id: restaurantId } : {};
    const restaurants = await Restaurant.find(filter).lean();
    const itemFilter =
      restaurantId && mongoose.isValidObjectId(restaurantId) ? { restaurantId } : {};
    const items = await MenuItem.find(itemFilter).lean();
    return { restaurants, items };
  }

  // Fallback memory catalog
  let restaurants = initialRestaurants.map((r, i) => ({
    ...r,
    _id: `mock-rest-${i + 1}`,
  }));

  if (restaurantId) {
    restaurants = restaurants.filter((r) => r._id === restaurantId || r.slug === restaurantId);
  }

  const items = restaurants.flatMap((r) =>
    getMenuItemsForRestaurant(r._id, r.slug).map((m, idx) => ({
      ...m,
      _id: `mock-item-${r._id}-${idx + 1}`,
      restaurantName: r.name,
    }))
  );

  return { restaurants, items };
}

// POST /api/ai/chat
aiRouter.post('/chat', async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, restaurantId, history = [] } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message text is required' });
      return;
    }

    const { restaurants, items } = await getCatalog(restaurantId);
    const query = message.toLowerCase().trim();

    // Check if external LLM API key is present
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey) {
      try {
        const systemPrompt = `You are "GourmetBot", an AI restaurant and menu concierge.
Available Restaurants:
${JSON.stringify(restaurants.map((r) => ({ id: r._id, name: r.name, cuisine: r.cuisine, rating: r.rating, deliveryTime: r.deliveryTimeMin, deliveryFee: r.deliveryFee, dietaryTags: r.dietaryTags })))}

Available Menu Items:
${JSON.stringify(items.map((i: any) => ({ id: i._id, name: i.name, category: i.category, price: i.price, dietary: i.dietaryTags, spice: i.spiceLevels, description: i.description })))}

Help the customer find the best dishes, understand dietary compatibility (vegan, halal, gluten-free, etc.), customize spice levels, and discover deals. Keep responses friendly, warm, and structured with bullet points.`;

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
        const resp = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: `${systemPrompt}\n\nCustomer query: ${message}` }],
              },
            ],
          }),
        });

        if (resp.ok) {
          const data: any = await resp.json();
          const replyText =
            data.candidates?.[0]?.content?.parts?.[0]?.text ||
            "I'm here to help you choose delicious meals from our restaurants!";
          res.status(200).json({
            reply: replyText,
            suggestedItems: items.slice(0, 3),
            quickReplies: [
              'What are your top rated items?',
              'Show me gluten-free choices',
              'Recommend a spicy dish',
            ],
          });
          return;
        }
      } catch (err) {
        console.warn('Gemini proxy error, falling back to local expert engine:', err);
      }
    }

    // Contextual expert recommendation engine
    let matchingItems: any[] = [];
    let replyText = '';
    let quickReplies: string[] = [];

    const isVeganQuery = /vegan|plant.?based|dairy.?free/i.test(query);
    const isGlutenFreeQuery = /gluten.?free|celiac/i.test(query);
    const isHalalQuery = /halal/i.test(query);
    const isVegetarianQuery = /vegetarian|veggie/i.test(query);
    const isSpicyQuery = /spic(y|e)|hot|fiery|chili|fire/i.test(query);
    const isMildQuery = /mild|non.?spicy|not spicy|gentle/i.test(query);
    const isBudgetQuery = /cheap|affordable|budget|under \$?15|deals?/i.test(query);
    const isDeliveryQuery = /deliver(y|)|fee|how long|time|wait/i.test(query);
    const isPastaPizzaQuery = /pizza|pasta|italian/i.test(query);
    const isSushiRamenQuery = /sushi|ramen|noodle|japanese/i.test(query);
    const isTacoQuery = /taco|birria|mexican/i.test(query);

    if (isDeliveryQuery) {
      const restSummaries = restaurants
        .map(
          (r) =>
            `• **${r.name}**: ${r.deliveryTimeMin} min average delivery, $${r.deliveryFee.toFixed(2)} delivery fee (Min order: $${r.minOrder.toFixed(2)})`
        )
        .join('\n');
      replyText = `Here is our current delivery breakdown:\n\n${restSummaries}\n\nMost orders arrive hot and fresh within 20 to 35 minutes! Would you like to check out their menus?`;
      quickReplies = ['Show me Trattoria Bella Roma', 'Show me Sakura Umami Kitchen', 'Browse under $15'];
    } else if (isVeganQuery) {
      matchingItems = items.filter(
        (i: any) =>
          i.dietaryTags?.some((t: string) => /vegan/i.test(t)) ||
          /vegan/i.test(i.name) ||
          /vegan/i.test(i.description)
      );
      replyText = `🌱 **Great plant-based choices for you!**\n\nWe feature dedicated vegan dining, especially at **Verde Pure Organic Bistro**.\n\nTop picks:\n${matchingItems
        .map((i) => `• **${i.name}** ($${i.price.toFixed(2)}) - ${i.description}`)
        .slice(0, 3)
        .join('\n')}\n\nYou can also customize add-ons such as crispy organic tofu or avocado slices!`;
      quickReplies = ['Are these gluten-free too?', 'What dressings are available?', 'Order Golden Turmeric Bowl'];
    } else if (isGlutenFreeQuery) {
      matchingItems = items.filter(
        (i: any) =>
          i.dietaryTags?.some((t: string) => /gluten.?free/i.test(t)) ||
          /gluten.?free/i.test(i.description)
      );
      replyText = `🌾 **Gluten-Free Selections:**\n\nHere are safety-conscious gluten-free favorites:\n\n${matchingItems
        .map((i) => `• **${i.name}** ($${i.price.toFixed(2)}) [${i.category}] - ${i.description}`)
        .slice(0, 3)
        .join('\n')}\n\nPlease note your preference in the dish special instructions so the kitchen prepares it on dedicated cookware!`;
      quickReplies = ['Show Birria QuesaTacos', 'Show Spicy Edamame', 'What vegan gluten-free options exist?'];
    } else if (isHalalQuery) {
      matchingItems = items.filter(
        (i: any) =>
          i.dietaryTags?.some((t: string) => /halal/i.test(t)) ||
          /halal/i.test(i.description)
      );
      replyText = `🌙 **Halal Friendly Recommendations:**\n\nWe feature certified halal meat options:\n\n${matchingItems
        .map((i) => `• **${i.name}** ($${i.price.toFixed(2)}) - ${i.description}`)
        .slice(0, 3)
        .join('\n')}\n\nOur kitchen staff observes strict separation and halal-certified sourcing.`;
      quickReplies = ['Show El Fuego Tacos', 'Recommend seafood options', 'Check delivery times'];
    } else if (isSpicyQuery) {
      matchingItems = items.filter(
        (i: any) =>
          i.spiceLevels?.some((s: string) => /hot|fire|chili|spicy/i.test(s)) ||
          /spicy/i.test(i.name)
      );
      replyText = `🌶️ **Fiery and Bold Favorites:**\n\nCraving that kick? Here are our best heat-packed dishes:\n\n${matchingItems
        .map(
          (i) =>
            `• **${i.name}** ($${i.price.toFixed(2)}) - Offers spice levels up to: *${i.spiceLevels?.slice(-1)[0] || 'Extra Hot'}*`
        )
        .slice(0, 3)
        .join('\n')}\n\nYou can select your exact spice level (from Mild to Extreme) when adding each dish to your cart!`;
      quickReplies = ['Level 2 Tokyo Fire Ramen', 'Birria Tacos with Fuego Habanero', 'Mild alternatives'];
    } else if (isPastaPizzaQuery) {
      matchingItems = items.filter((i: any) => /pizza|pasta|antipasti/i.test(i.category));
      replyText = `🇮🇹 **Authentic Italian Flavors at Trattoria Bella Roma:**\n\n${matchingItems
        .map((i) => `• **${i.name}** ($${i.price.toFixed(2)}) - ${i.description}`)
        .slice(0, 3)
        .join('\n')}\n\nAll our pizzas are baked in a 900°F stone oven with San Marzano tomatoes!`;
      quickReplies = ['Customize Truffle Pizza', 'Add Wild Boar Pappardelle', 'See Desserts'];
    } else if (isSushiRamenQuery) {
      matchingItems = items.filter((i: any) => /ramen|sushi/i.test(i.category));
      replyText = `🍣 **Umami Delights at Sakura Japanese Kitchen:**\n\n${matchingItems
        .map((i) => `• **${i.name}** ($${i.price.toFixed(2)}) - ${i.description}`)
        .slice(0, 3)
        .join('\n')}\n\nPair your bowl with flame-torched Aburi rolls and garlic togarashi edamame!`;
      quickReplies = ['Order Tonkotsu Ramen', 'Salmon Aburi Roll details', 'How spicy is the broth?'];
    } else if (isBudgetQuery) {
      matchingItems = items.filter((i: any) => i.price <= 15).sort((a: any, b: any) => a.price - b.price);
      replyText = `💰 **Value & Budget Friendly Dishes (Under $15):**\n\n${matchingItems
        .map((i) => `• **${i.name}** — **$${i.price.toFixed(2)}** (${i.category})`)
        .slice(0, 4)
        .join('\n')}\n\nAdd any item directly to your cart and customize sizes to fit your meal plan!`;
      quickReplies = ['Show me appetizers', 'Any combo deals?', 'Free delivery options'];
    } else {
      // General concierge recommendations
      matchingItems = items.filter((i: any) => i.popular).slice(0, 3);
      replyText = `👋 Hello! I am your **GourmetOS Dining Assistant**.\n\nI can help you browse menus, find dishes tailored to dietary preferences (vegan, halal, gluten-free), adjust spice levels, or calculate meal estimates.\n\n🌟 **Today's Chef Recommendations:**\n${matchingItems
        .map((i) => `• **${i.name}** ($${i.price.toFixed(2)}) - ${i.description}`)
        .join('\n')}\n\nWhat kind of flavors are you in the mood for today?`;
      quickReplies = [
        'Recommend something spicy 🌶️',
        'Show vegan & gluten-free options 🌱',
        'What are the popular pizzas & pastas?',
        'Fastest delivery times ⏱️',
      ];
    }

    res.status(200).json({
      reply: replyText,
      suggestedItems: matchingItems.slice(0, 3),
      quickReplies,
    });
  } catch (error) {
    console.error('Error in AI chat proxy:', error);
    res.status(500).json({
      error: 'Failed to process AI chat inquiry',
      reply: "I'm having a brief hiccup connecting to the kitchen records. Feel free to browse our categorized menu directly!",
    });
  }
});

// POST /api/ai/generate-menu-item - AI Description, Tag & Category Generator
aiRouter.post('/generate-menu-item', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, cuisine, category: userCategory, keywords } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      res.status(400).json({ error: 'Item name is required for AI generation' });
      return;
    }

    const dishName = name.trim();
    const geminiKey = process.env.GEMINI_API_KEY;

    if (geminiKey) {
      try {
        const prompt = `You are an elite Michelin-caliber culinary copywriter and menu strategist.
Given the dish name "${dishName}"${cuisine ? ` in ${cuisine} cuisine` : ''}${userCategory ? ` for category ${userCategory}` : ''}${keywords ? ` with keywords: ${keywords}` : ''}:
Generate an enticing, professional menu item object. Output ONLY a valid JSON object matching this schema without any markdown formatting or commentary:
{
  "description": "Appetizing description emphasizing fresh ingredients, artisanal cooking methods, and flavor profile (2-3 sentences)",
  "category": "Suggested category name (e.g. Traditional Karahi, Wood-Fired Pizza, Chef Specials, Gourmet Burgers, Handcrafted Pasta, Starters, Desserts, Beverages)",
  "dietaryTags": ["array of 2-3 accurate dietary tags such as Halal, Vegetarian, Vegan, Gluten-Free, High Protein, Dairy-Free"],
  "spiceLevels": ["array of 3-4 progressive spice options e.g. Mild, Medium, Hot, Extra Hot"],
  "suggestedPrice": 14.50,
  "sizes": [
    {"id": "size-reg", "name": "Regular Portion", "priceDelta": 0},
    {"id": "size-large", "name": "Large / Sharing Portion", "priceDelta": 4.50}
  ],
  "addOns": [
    {"id": "addon-1", "name": "Complementary side or topping", "price": 2.00},
    {"id": "addon-2", "name": "Premium upgrade", "price": 3.00}
  ]
}`;

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
        const resp = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json' },
          }),
        });

        if (resp.ok) {
          const data: any = await resp.json();
          const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const parsed = JSON.parse(rawText);
            res.status(200).json({ source: 'gemini-ai', item: parsed });
            return;
          }
        }
      } catch (geminiErr) {
        console.warn('Gemini generate-menu-item fallback triggered:', geminiErr);
      }
    }

    // High quality intelligent recipe engine fallback
    const q = dishName.toLowerCase();

    let category = userCategory || 'Chef Specials';
    let description = '';
    let dietaryTags: string[] = ['Halal', 'Chef Special'];
    let spiceLevels = ['None', 'Mild', 'Medium', 'Hot'];
    let suggestedPrice = 16.5;
    let sizes = [
      { id: 'size-reg', name: 'Regular Portion', priceDelta: 0 },
      { id: 'size-large', name: 'Deluxe / Sharing Portion', priceDelta: 5.0 },
    ];
    let addOns = [
      { id: 'addon-extra-sauce', name: 'House Dipping Sauce', price: 1.5 },
      { id: 'addon-cheese', name: 'Melted Cheddar / Mozzarella', price: 2.0 },
    ];

    if (/burger|patty|smash/i.test(q)) {
      category = 'Gourmet Burgers';
      description = `Seared prime beef smash patty with crisp caramelized edges on a toasted buttery brioche bun, topped with aged cheddar, caramelized balsamic onions, and signature smoked secret sauce.`;
      dietaryTags = ['Halal', 'Popular'];
      spiceLevels = ['Original Mild', 'Chipotle Medium', 'Ghost Pepper Fiery'];
      suggestedPrice = 12.5;
      sizes = [
        { id: 'size-single', name: 'Single 150g Patty', priceDelta: 0 },
        { id: 'size-double', name: 'Double 300g Patty Deluxe', priceDelta: 4.5 },
      ];
      addOns = [
        { id: 'addon-bacon', name: 'Crispy Beef Bacon Strips', price: 2.5 },
        { id: 'addon-fries', name: 'Seasoned Truffle Parmesan Fries', price: 3.5 },
      ];
    } else if (/\b(karahi|handi|shinwari|nihari|haleem)\b/i.test(q) || /mutton/i.test(q)) {
      category = 'Traditional Karahi & Handi';
      description = `Tender bone-in meat slow-braised in a traditional iron wok with sweet vine tomatoes, slivered ginger, and cracked black peppercorns, finished with fragrant fresh coriander and desi butter.`;
      dietaryTags = ['Halal', 'High Protein', 'Gluten-Free'];
      spiceLevels = ['Mild Black Pepper', 'Authentic Shinwari Medium', 'Extra Desi Mirch'];
      suggestedPrice = 22.0;
      sizes = [
        { id: 'size-half', name: 'Half KG (1-2 Persons)', priceDelta: 0 },
        { id: 'size-full', name: 'Full 1 KG (3-4 Persons)', priceDelta: 16.0 },
      ];
      addOns = [
        { id: 'addon-roghni', name: 'Warm Roghni Naan (2 pcs)', price: 2.0 },
        { id: 'addon-raita', name: 'Mint Zeera Raita & Kachumber Salad', price: 1.5 },
        { id: 'addon-makhan', name: 'Desi Makhan (Butter) Dollop', price: 1.75 },
      ];
    } else if (/pizza/i.test(q)) {
      category = 'Wood-Fired Pizza';
      description = `48-hour fermented artisanal sourdough crust blistered at 900°F, topped with crushed San Marzano tomato coulis, fresh fior di latte mozzarella, and cold-pressed extra virgin olive oil.`;
      dietaryTags = ['Vegetarian Friendly', 'Artisanal'];
      spiceLevels = ['Classic Non-Spicy', 'Chili Flake Mild', 'Spicy Diablo'];
      suggestedPrice = 17.0;
      sizes = [
        { id: 'size-10', name: 'Personal 10"', priceDelta: 0 },
        { id: 'size-14', name: 'Classic 14"', priceDelta: 5.5 },
        { id: 'size-18', name: 'Family 18"', priceDelta: 10.0 },
      ];
      addOns = [
        { id: 'addon-crust', name: 'Garlic Butter Herb Crust', price: 2.5 },
        { id: 'addon-burrata', name: 'Fresh Creamy Burrata Heart', price: 4.0 },
      ];
    } else if (/pasta|fettuccine|penne|ravioli/i.test(q)) {
      category = 'Handcrafted Pasta';
      description = `Silky handmade durum wheat pasta tossed in a velvety emulsion of Parmigiano-Reggiano, sweet butter, roasted garlic, and freshly cracked Tellicherry black pepper.`;
      dietaryTags = ['Vegetarian Friendly', 'Italian Classic'];
      spiceLevels = ['Delicate Mild', 'Peppery Medium', 'Spicy Arrabbiata'];
      suggestedPrice = 16.0;
      sizes = [
        { id: 'size-reg', name: 'Regular Portion', priceDelta: 0 },
        { id: 'size-large', name: 'Large Portion (+35%)', priceDelta: 4.5 },
      ];
      addOns = [
        { id: 'addon-truffle', name: 'Fresh Shaved Black Truffle', price: 4.5 },
        { id: 'addon-ciabatta', name: 'Toasted Garlic Ciabatta', price: 2.0 },
      ];
    } else if (/ramen|sushi|teriyaki|tempura/i.test(q)) {
      category = 'Signature Japanese';
      description = `Expertly assembled using master technique, paired with umami-rich broths and seasonings, garnished with micro-greens, toasted sesame seeds, and scallions.`;
      dietaryTags = ['Pescatarian Friendly', 'Umami Rich'];
      spiceLevels = ['Level 0 - Non-Spicy', 'Level 1 - Tokyo Mild', 'Level 2 - Tokyo Fire'];
      suggestedPrice = 18.0;
      sizes = [
        { id: 'size-reg', name: 'Standard Bowl / Roll', priceDelta: 0 },
        { id: 'size-mega', name: 'Deluxe Combo (+50%)', priceDelta: 5.5 },
      ];
      addOns = [
        { id: 'addon-egg', name: 'Ajitsuke Tamago (Soy Egg)', price: 1.75 },
        { id: 'addon-avocado', name: 'Fresh Hass Avocado Slices', price: 2.0 },
      ];
    } else if (/taco|fajita|burrito/i.test(q)) {
      category = 'Street Tacos & Cantina';
      description = `Warm stone-ground corn tortillas piled with citrus-marinated seared meat, pico de gallo, fresh cilantro, and a drizzle of smoky charred jalapeño crema.`;
      dietaryTags = ['Halal', 'Gluten-Free'];
      spiceLevels = ['Mild Verde', 'Chipotle Medium', 'Fuego Habanero'];
      suggestedPrice = 13.5;
      sizes = [
        { id: 'size-3tacos', name: 'Trio (3 Tacos)', priceDelta: 0 },
        { id: 'size-5tacos', name: 'Fiesta Pack (5 Tacos)', priceDelta: 6.5 },
      ];
      addOns = [
        { id: 'addon-guac', name: 'Fresh Hand-Mashed Guacamole', price: 3.0 },
        { id: 'addon-chips', name: 'Warm House Tortilla Chips', price: 2.0 },
      ];
    } else if (/salad|bowl|vegan|green/i.test(q)) {
      category = 'Nourish Bowls & Salads';
      description = `Vibrant organic greens and warm heritage grains tossed with seasonal crisp vegetables, toasted seeds, and an invigorating house-made cold-pressed vinaigrette.`;
      dietaryTags = ['100% Vegan', 'Gluten-Free', 'Organic'];
      spiceLevels = ['Crisp Herb Zero Spice', 'Ginger Chili Mild'];
      suggestedPrice = 12.0;
      sizes = [
        { id: 'size-24oz', name: 'Regular 24oz Bowl', priceDelta: 0 },
        { id: 'size-32oz', name: 'Power 32oz Bowl', priceDelta: 3.5 },
      ];
      addOns = [
        { id: 'addon-tofu', name: 'Crispy Baked Organic Tofu', price: 2.5 },
        { id: 'addon-nuts', name: 'Toasted Pecans & Walnuts', price: 1.75 },
      ];
    } else if (/cake|tiramisu|dessert|brownie|sweet|shake/i.test(q)) {
      category = 'Artisanal Desserts & Sweets';
      description = `Decadent sweet creation prepared with premium Belgian chocolate, Madagascan vanilla beans, and velvety whipped dairy cream for an indulgent finale.`;
      dietaryTags = ['Vegetarian'];
      spiceLevels = ['Sweet & Smooth'];
      suggestedPrice = 8.5;
      sizes = [
        { id: 'size-slice', name: 'Single Serving', priceDelta: 0 },
        { id: 'size-share', name: 'Deluxe Sharing Plate', priceDelta: 4.0 },
      ];
      addOns = [
        { id: 'addon-icecream', name: 'Scoop of Vanilla Bean Gelato', price: 2.5 },
        { id: 'addon-berries', name: 'Fresh Mixed Wild Berries', price: 2.0 },
      ];
    } else {
      // General signature dish
      description = `Masterfully crafted with premium selected ingredients, balanced spices, and gourmet technique to deliver exceptional depth of flavor in every bite.`;
    }

    res.status(200).json({
      source: 'expert-culinary-engine',
      item: {
        name: dishName,
        category,
        description,
        dietaryTags,
        spiceLevels,
        suggestedPrice,
        sizes,
        addOns,
      },
    });
  } catch (error) {
    console.error('Error in AI menu item generation:', error);
    res.status(500).json({ error: 'Failed to generate menu item description' });
  }
});
