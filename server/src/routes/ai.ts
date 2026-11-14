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
