import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const foods = [
  { name: 'Roti (whole wheat)', category: 'home_food', portion_label: '1 piece', calories: 120, protein_g: 3.5, carbs_g: 24, fat_g: 0.8 },
  { name: 'Naan', category: 'home_food', portion_label: '1 piece', calories: 260, protein_g: 7, carbs_g: 48, fat_g: 4 },
  { name: 'Paratha (plain)', category: 'home_food', portion_label: '1 piece', calories: 260, protein_g: 5, carbs_g: 32, fat_g: 12 },
  { name: 'Chawal (plain white rice)', category: 'home_food', portion_label: '1 plate', calories: 260, protein_g: 5, carbs_g: 56, fat_g: 0.5 },
  { name: 'Chicken Biryani', category: 'home_food', portion_label: '1 plate', calories: 450, protein_g: 22, carbs_g: 55, fat_g: 16 },
  { name: 'Mutton Biryani', category: 'home_food', portion_label: '1 plate', calories: 520, protein_g: 24, carbs_g: 55, fat_g: 22 },
  { name: 'Daal Chawal (lentils + rice)', category: 'home_food', portion_label: '1 plate', calories: 380, protein_g: 14, carbs_g: 62, fat_g: 8 },
  { name: 'Chana Daal', category: 'home_food', portion_label: '1 katori', calories: 180, protein_g: 9, carbs_g: 24, fat_g: 5 },
  { name: 'Masoor Daal', category: 'home_food', portion_label: '1 katori', calories: 150, protein_g: 9, carbs_g: 22, fat_g: 3 },
  { name: 'Chicken Karahi', category: 'home_food', portion_label: '1 katori', calories: 320, protein_g: 26, carbs_g: 6, fat_g: 21 },
  { name: 'Mutton Karahi', category: 'home_food', portion_label: '1 katori', calories: 400, protein_g: 28, carbs_g: 6, fat_g: 29 },
  { name: 'Beef Nihari', category: 'home_food', portion_label: '1 katori', calories: 380, protein_g: 24, carbs_g: 8, fat_g: 27 },
  { name: 'Haleem', category: 'home_food', portion_label: '1 katori', calories: 300, protein_g: 18, carbs_g: 28, fat_g: 12 },
  { name: 'Chicken Qorma', category: 'home_food', portion_label: '1 katori', calories: 340, protein_g: 22, carbs_g: 10, fat_g: 23 },
  { name: 'Aloo Gosht', category: 'home_food', portion_label: '1 katori', calories: 310, protein_g: 20, carbs_g: 14, fat_g: 19 },
  { name: 'Aloo Palak', category: 'home_food', portion_label: '1 katori', calories: 150, protein_g: 4, carbs_g: 16, fat_g: 8 },
  { name: 'Bhindi (okra) Sabzi', category: 'home_food', portion_label: '1 katori', calories: 120, protein_g: 3, carbs_g: 10, fat_g: 8 },
  { name: 'Aloo Bhujia', category: 'home_food', portion_label: '1 katori', calories: 180, protein_g: 3, carbs_g: 22, fat_g: 9 },
  { name: 'Mixed Vegetable Curry', category: 'home_food', portion_label: '1 katori', calories: 140, protein_g: 4, carbs_g: 16, fat_g: 6 },
  { name: 'Chicken Tikka', category: 'home_food', portion_label: '2 pieces', calories: 220, protein_g: 28, carbs_g: 2, fat_g: 11 },
  { name: 'Seekh Kabab (beef)', category: 'home_food', portion_label: '2 pieces', calories: 250, protein_g: 18, carbs_g: 4, fat_g: 18 },
  { name: 'Chapli Kabab', category: 'home_food', portion_label: '1 piece', calories: 280, protein_g: 16, carbs_g: 6, fat_g: 21 },
  { name: 'Samosa (potato)', category: 'home_food', portion_label: '1 piece', calories: 150, protein_g: 3, carbs_g: 18, fat_g: 7 },
  { name: 'Pakora (mixed)', category: 'home_food', portion_label: '4 pieces', calories: 180, protein_g: 5, carbs_g: 18, fat_g: 10 },
  { name: 'Egg (boiled)', category: 'home_food', portion_label: '1 piece', calories: 78, protein_g: 6, carbs_g: 0.6, fat_g: 5 },
  { name: 'Egg Omelette (2 eggs)', category: 'home_food', portion_label: '1 serving', calories: 190, protein_g: 13, carbs_g: 1, fat_g: 15 },
  { name: 'Anda Curry (egg curry)', category: 'home_food', portion_label: '1 katori', calories: 220, protein_g: 12, carbs_g: 8, fat_g: 16 },
  { name: 'Chicken Pulao', category: 'home_food', portion_label: '1 plate', calories: 400, protein_g: 18, carbs_g: 58, fat_g: 12 },
  { name: 'Yakhni Pulao', category: 'home_food', portion_label: '1 plate', calories: 380, protein_g: 16, carbs_g: 56, fat_g: 11 },
  { name: 'Sabzi Pulao', category: 'home_food', portion_label: '1 plate', calories: 320, protein_g: 6, carbs_g: 58, fat_g: 8 },
  { name: 'Dahi (plain yogurt)', category: 'home_food', portion_label: '1 katori', calories: 90, protein_g: 5, carbs_g: 7, fat_g: 4.5 },
  { name: 'Raita', category: 'home_food', portion_label: '1 katori', calories: 70, protein_g: 3, carbs_g: 6, fat_g: 3.5 },
  { name: 'Lassi (sweet)', category: 'home_food', portion_label: '1 glass', calories: 220, protein_g: 6, carbs_g: 30, fat_g: 8 },
  { name: 'Doodh Patti Chai', category: 'home_food', portion_label: '1 cup', calories: 110, protein_g: 3, carbs_g: 12, fat_g: 5 },
  { name: 'Kheer', category: 'home_food', portion_label: '1 katori', calories: 220, protein_g: 5, carbs_g: 34, fat_g: 7 },
  { name: 'Gulab Jamun', category: 'home_food', portion_label: '1 piece', calories: 150, protein_g: 2, carbs_g: 20, fat_g: 7 },
  { name: 'Jalebi', category: 'home_food', portion_label: '2 pieces', calories: 220, protein_g: 2, carbs_g: 36, fat_g: 8 },
  { name: 'Halwa (sooji)', category: 'home_food', portion_label: '1 katori', calories: 260, protein_g: 3, carbs_g: 32, fat_g: 14 },
  { name: 'Fruit Chaat', category: 'home_food', portion_label: '1 bowl', calories: 130, protein_g: 2, carbs_g: 32, fat_g: 0.5 },
  { name: 'Chana Chaat', category: 'home_food', portion_label: '1 bowl', calories: 200, protein_g: 9, carbs_g: 30, fat_g: 6 },
  { name: 'Dahi Bhalla', category: 'home_food', portion_label: '2 pieces', calories: 180, protein_g: 6, carbs_g: 22, fat_g: 8 },
  { name: 'Boiled Chickpeas (chole plain)', category: 'home_food', portion_label: '1 katori', calories: 210, protein_g: 12, carbs_g: 35, fat_g: 3 },
  { name: 'Chole Curry', category: 'home_food', portion_label: '1 katori', calories: 260, protein_g: 12, carbs_g: 32, fat_g: 10 },
  { name: 'Grilled Chicken Breast', category: 'home_food', portion_label: '100g', calories: 165, protein_g: 31, carbs_g: 0, fat_g: 3.6 },
  { name: 'Fried Fish', category: 'home_food', portion_label: '1 piece', calories: 250, protein_g: 20, carbs_g: 8, fat_g: 16 },
  { name: 'Sabzi Daal (mix vegetable + lentil)', category: 'home_food', portion_label: '1 katori', calories: 160, protein_g: 8, carbs_g: 20, fat_g: 5 },
  { name: 'Chicken Broast', category: 'home_food', portion_label: '1 piece', calories: 320, protein_g: 24, carbs_g: 10, fat_g: 20 },
  { name: 'Naan Chana (street food)', category: 'home_food', portion_label: '1 serving', calories: 380, protein_g: 12, carbs_g: 58, fat_g: 11 },
  { name: 'Sindhi Biryani', category: 'home_food', portion_label: '1 plate', calories: 480, protein_g: 22, carbs_g: 58, fat_g: 18 },
  { name: 'Fried Rice (chicken)', category: 'home_food', portion_label: '1 plate', calories: 420, protein_g: 16, carbs_g: 55, fat_g: 15 },

  { name: 'Zinger Burger', category: 'restaurant', restaurant_name: 'KFC', portion_label: '1 piece', calories: 450, protein_g: 21, carbs_g: 45, fat_g: 21 },
  { name: 'Original Recipe Chicken (2pc)', category: 'restaurant', restaurant_name: 'KFC', portion_label: '2 pieces', calories: 470, protein_g: 38, carbs_g: 12, fat_g: 30 },
  { name: 'Big Mac', category: 'restaurant', restaurant_name: "McDonald's", portion_label: '1 piece', calories: 550, protein_g: 25, carbs_g: 45, fat_g: 30 },
  { name: 'McChicken', category: 'restaurant', restaurant_name: "McDonald's", portion_label: '1 piece', calories: 400, protein_g: 16, carbs_g: 40, fat_g: 20 },
  { name: 'French Fries (medium)', category: 'restaurant', restaurant_name: "McDonald's", portion_label: '1 medium', calories: 340, protein_g: 4, carbs_g: 44, fat_g: 16 },
  { name: 'Whopper', category: 'restaurant', restaurant_name: 'Burger King', portion_label: '1 piece', calories: 660, protein_g: 28, carbs_g: 49, fat_g: 40 },
  { name: 'Chicken Royale', category: 'restaurant', restaurant_name: 'Burger King', portion_label: '1 piece', calories: 480, protein_g: 20, carbs_g: 44, fat_g: 25 },
  { name: 'Chicken Tikka Sub (6 inch)', category: 'restaurant', restaurant_name: 'Subway', portion_label: '6 inch', calories: 380, protein_g: 24, carbs_g: 48, fat_g: 10 },
  { name: 'Chicken Biryani (regular)', category: 'restaurant', restaurant_name: 'Student Biryani', portion_label: '1 plate', calories: 480, protein_g: 20, carbs_g: 60, fat_g: 18 },
  { name: 'Beef Karahi (per person)', category: 'restaurant', restaurant_name: 'Bundu Khan', portion_label: '1 serving', calories: 420, protein_g: 28, carbs_g: 8, fat_g: 30 },
  { name: 'BBQ Platter', category: 'restaurant', restaurant_name: 'Bundu Khan', portion_label: '1 serving', calories: 550, protein_g: 40, carbs_g: 12, fat_g: 38 },
  { name: 'Chicken Chargha (half)', category: 'restaurant', restaurant_name: 'Howdy', portion_label: 'half', calories: 480, protein_g: 42, carbs_g: 6, fat_g: 32 },
  { name: 'Loaded Fries', category: 'restaurant', restaurant_name: 'Cheezious', portion_label: '1 serving', calories: 520, protein_g: 14, carbs_g: 48, fat_g: 30 },
  { name: 'Pizza Slice (chicken tikka)', category: 'restaurant', restaurant_name: 'Cheezious', portion_label: '1 slice', calories: 260, protein_g: 12, carbs_g: 28, fat_g: 11 },
  { name: 'Chicken Boti Platter', category: 'restaurant', restaurant_name: 'Kababjees', portion_label: '1 serving', calories: 400, protein_g: 34, carbs_g: 6, fat_g: 26 },
  { name: 'Cappuccino (medium)', category: 'restaurant', restaurant_name: "Gloria Jean's", portion_label: 'medium', calories: 150, protein_g: 8, carbs_g: 15, fat_g: 7 },
  { name: 'Cafe Latte (medium)', category: 'restaurant', restaurant_name: 'Espresso', portion_label: 'medium', calories: 190, protein_g: 9, carbs_g: 18, fat_g: 9 },

  { name: 'Coca-Cola', category: 'packaged', portion_label: '1 can (330ml)', calories: 140, protein_g: 0, carbs_g: 39, fat_g: 0 },
  { name: 'Lays Classic', category: 'packaged', portion_label: '1 small pack', calories: 160, protein_g: 2, carbs_g: 15, fat_g: 10 },
  { name: 'Banana', category: 'home_food', portion_label: '1 medium', calories: 105, protein_g: 1.3, carbs_g: 27, fat_g: 0.4 },
  { name: 'Apple', category: 'home_food', portion_label: '1 medium', calories: 95, protein_g: 0.5, carbs_g: 25, fat_g: 0.3 },
  { name: 'Mango', category: 'home_food', portion_label: '1 medium', calories: 150, protein_g: 1.4, carbs_g: 38, fat_g: 0.6 },
  { name: 'Orange', category: 'home_food', portion_label: '1 medium', calories: 62, protein_g: 1.2, carbs_g: 15, fat_g: 0.2 },
  { name: 'Almonds', category: 'home_food', portion_label: '10 pieces', calories: 70, protein_g: 2.5, carbs_g: 2.5, fat_g: 6 },
  { name: 'Peanuts (roasted)', category: 'home_food', portion_label: '1 handful (30g)', calories: 170, protein_g: 7, carbs_g: 5, fat_g: 14 },
]

async function seed() {
  console.log(`Seeding ${foods.length} foods...`)
  const { data, error } = await supabase.from('foods').insert(foods).select()

  if (error) {
    console.error('Seed failed:', error.message)
    process.exit(1)
  }

  console.log(`✅ Inserted ${data.length} food items.`)
}

seed()