export const MENU_CATEGORIES = [
  "嚴選茗品",
  "牧場直送",
  "雲朵奶蓋",
  "經典純粹",
  "香醇濃郁",
  "職人手作",
  "匠人茶點"
];

export const PRODUCTS = [
  // 嚴選茗品
  { name: "玉露青茶", englishName: "Taiwanese Ching Tea", category: "嚴選茗品", price: 35 },
  { name: "桂花青茶", englishName: "Osmanthus Ching Tea", category: "嚴選茗品", price: 35 },
  { name: "炭燒青茶", englishName: "Olong Tea", category: "嚴選茗品", price: 35 },
  
  // 牧場直送
  { name: "紅茶拿鐵", englishName: "Black Tea Latte", category: "牧場直送", price: 65 },
  { name: "翡翠拿鐵", englishName: "Jasmine Tea Latte", category: "牧場直送", price: 65 },
  { name: "鐵觀音拿鐵", englishName: "Olong Tea Latte", category: "牧場直送", price: 65 },
  { name: "仙草嫩奶", englishName: "Grass Jelly Milk", category: "牧場直送", price: 65, tags: ["Contains Creamer"] },
  { name: "珍珠粉粿牛奶", englishName: "Pearl Milk with Coffee Jelly", category: "牧場直送", price: 69 },

  // 雲朵奶蓋
  { name: "酪梨奶蓋紅玉", englishName: "Taiwanese Black Tea with Avocado Milk Foam", category: "雲朵奶蓋", price: 65 },
  { name: "酪梨奶蓋綠茶", englishName: "Taiwanese Jasmine Green Tea with Avocado Milk Foam", category: "雲朵奶蓋", price: 65 },
  { name: "酪梨奶蓋烏龍", englishName: "Olong Tea with Avocado Milk Foam", category: "雲朵奶蓋", price: 65 },
  { name: "酪梨奶蓋冬瓜露", englishName: "Winter Melon Drink with Avocado Milk Foam", category: "雲朵奶蓋", price: 65 },

  // 經典純粹
  { name: "翡翠綠茶", englishName: "Jasmine Green Tea", category: "經典純粹", price: 35 },
  { name: "紅玉紅茶", englishName: "Taiwanese Black Tea", category: "經典純粹", price: 35 },
  { name: "御品冬瓜露", englishName: "Winter Melon Drink", category: "經典純粹", price: 35 },
  { name: "熟成油切蕎麥", englishName: "Buckwheat Tea", category: "經典純粹", price: 35, tags: ["Sugar Free"] },
  { name: "冷萃東方美人", englishName: "Cold Brew Oriental Beauty Tea", category: "經典純粹", price: 50 },
  { name: "冷萃半熟金萱", englishName: "Cold Brew Jin Xuan Tea", category: "經典純粹", price: 50 },

  // 香醇濃郁
  { name: "玉露奶青/桂花奶青", englishName: "Taiwanese Ching Milk Tea / Osmanthus Ching Milk Tea", category: "香醇濃郁", price: 55 },
  { name: "懷舊經典奶茶/翡翠奶綠/鐵觀音奶茶", englishName: "Milk Tea", category: "香醇濃郁", price: 50 },
  { name: "熟成蕎麥奶茶", englishName: "Buckwheat Milk Tea", category: "香醇濃郁", price: 55 },
  { name: "珍珠奶茶", englishName: "Bubble Milk Tea", category: "香醇濃郁", price: 55 },
  { name: "烤糖蕎麥凍奶青", englishName: "Buckwheat Jelly Taiwanese Ching Milk Tea", category: "香醇濃郁", price: 65 },
  { name: "咖啡粉粿蕎麥奶", englishName: "Coffee Jelly with Buckwheat Milk Tea", category: "香醇濃郁", price: 65 },

  // 職人手作
  { name: "蘋果玉露青", englishName: "Apple Taiwanese Ching Tea", category: "職人手作", price: 69, tags: ["Light Sugar At Least"] },
  { name: "老奶奶的鳳梨田", englishName: "Pineapple Juice Taiwanese Ching Tea", category: "職人手作", price: 69, tags: ["Contains tree nuts"] },
  { name: "甘蔗玉露青", englishName: "Sugar Cane Taiwanese Ching Tea", category: "職人手作", price: 65 },
  { name: "冬瓜玉露青", englishName: "Winter Melon Taiwanese Ching Tea", category: "職人手作", price: 45 },
  { name: "纖榨冬瓜露", englishName: "Lemon Winter Melon Drink", category: "職人手作", price: 55 },
  { name: "翡翠多多青", englishName: "Yakult Jasmine Green Tea", category: "職人手作", price: 55 },
  { name: "檸檬桂花青", englishName: "Lemon Osmanthus Ching Tea", category: "職人手作", price: 65, tags: ["Light Sugar At Least"] },
  { name: "百香翡翠青", englishName: "Passion Jasmine Green Tea", category: "職人手作", price: 60 },
  { name: "柳橙翡翠青", englishName: "Orange Jasmine Green Tea", category: "職人手作", price: 69, tags: ["Light Sugar At Least"] },

  // 匠人茶點
  { name: "酪梨奶蓋泡芙", englishName: "Avocado Milk Foam Puff", category: "匠人茶點", price: 85, description: "2pcs: 85, 4pcs: 170, 6pcs: 255" },
  { name: "花生奶蓋泡芙", englishName: "Peanut Milk Foam Puff", category: "匠人茶點", price: 85, description: "2pcs: 85, 4pcs: 170, 6pcs: 255" }
];

export const TOPPINGS = [
  { name: "波霸珍珠 Bubble", price: 10 },
  { name: "嫩仙草 Grass Jelly", price: 10 },
  { name: "烤糖蕎麥凍 Buckwheat Jelly", price: 15 },
  { name: "酪梨奶蓋 Avocado Milk Foam", price: 30 },
  { name: "咖啡粉粿 Coffee Jelly", price: 15 }
];

export const SWEETNESS_LEVELS = ["正常", "少糖", "半糖", "微糖", "1分糖", "無糖"];
export const ICE_LEVELS = ["正常", "微冰", "去冰", "完全去冰"];
