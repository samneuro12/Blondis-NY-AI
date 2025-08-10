// src/catalog.js
export const productCatalog = {
  "Sulfate-Free Shampoo": {
    name: "BLONDIS™ New York Luxurious Sulfate-Free Shampoo",
    url: "https://blondis.us/shop/", // product grid with item visible
    tags: ["gentle","hydrating","color/keratin safe"]
  },
  "Rich Conditioner": {
    name: "BLONDIS™ New York Luxurious Rich Conditioner",
    url: "https://blondis.us/shop/",
    tags: ["repair","moisture","daily"]
  },
  "Clarifying Shampoo": {
    name: "BLONDIS™ New York Luxurious Clarifying Shampoo",
    url: "https://blondis.us/shop/",
    tags: ["clarify","reset","buildup"]
  },
  "Reparative Hair Mask": {
    name: "BLONDIS™ Luxurious Reparative Hair Mask",
    url: "https://blondis.us/shop/",
    tags: ["bond-building","damage repair","weekly"]
  },
  "Shine Serum": {
    name: "BLONDIS™ Luxurious Reparative Hair Shine Serum",
    url: "https://blondis.us/shop/",
    tags: ["finish","anti-frizz","gloss"]
  },
  "Curl Crème": {
    name: "BLONDIS™ New York Curl Crème",
    url: "https://blondis.us/shop/",
    tags: ["define","moisture","hold-light"]
  },
  "Purple Shampoo": {
    name: "Blond Resolution Purple Shampoo",
    url: "https://looliacloset.com/collections/blondis-new-york", // alt listing with clear name
    tags: ["tone brass","blonde care","weekly"]
  },
  "Smoothing System": {
    name: "BLONDIS™ Multi Protein Smoothing System (0% formaldehyde)",
    url: "https://blondisnylb.com/at-home-service",
    tags: ["salon","smoothing","keratin-safe"]
  },
  "Fiks": {
    name: "BLONDIS™ New York FIKS",
    url: "https://blondis.us/",
    tags: ["treatment"]
  }
};

// map generic recommendation label -> catalog key above
export function mapGenericToBlondis(generic) {
  const map = {
    // shampoos
    "Hydrating shampoo (sulfate-free)": "Sulfate-Free Shampoo",
    "Gentle daily shampoo (sulfate-free)": "Sulfate-Free Shampoo",
    "Balancing shampoo (sulfate-free)": "Sulfate-Free Shampoo",
    "Clarifying shampoo (1×/week)": "Clarifying Shampoo",
    "Clarifying shampoo (every 2–4 weeks)": "Clarifying Shampoo",

    // conditioners & masks
    "Lightweight conditioner": "Rich Conditioner",
    "Repair/strength conditioner (with proteins + lipids)": "Rich Conditioner",
    "Bond-building mask (1×/week)": "Reparative Hair Mask",

    // stylers & finish
    "Light curl cream or sea-salt-friendly gel": "Curl Crème",
    "Curl cream + gel (cast, then scrunch out)": "Curl Crème",
    "Anti-humidity finishing spray/serum": "Shine Serum",

    // tone
    "Purple toning shampoo (1×/week)": "Purple Shampoo",
  };

  const key = map[generic];
  if (!key) return null;
  return productCatalog[key] || null;
}
