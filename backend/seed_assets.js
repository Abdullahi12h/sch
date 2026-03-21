import mongoose from 'mongoose';
import Asset from './models/Asset.js';
import AssetCategory from './models/AssetCategory.js';

const MONGO_URI = 'mongodb+srv://abdullahidacad28_db_user:6kaRPqA60b8agm4L@cluster0.i2zv7fu.mongodb.net/hn12?retryWrites=true&w=majority&appName=Cluster0';

const categories = [
    { name: 'Furniture', description: 'Kuraasta, miisaska, armaajooyinka iyo alaabta fadhiga' },
    { name: 'ICT & Electronics', description: 'Laptop-yada, Desktop-yada, Projector-ada iyo qalabka korontada' },
    { name: 'Maintenance Tools', description: 'Hardware, Drills, iyo qalabka dayactirka' },
    { name: 'Stationery', description: 'Waraaqaha, qalinka, iyo agabka xafiiska' },
    { name: 'Academic & Lab Supplies', description: 'Buugaagta casharka iyo qalabka shaybaarka' },
    { name: 'Janitorial & Health', description: 'Nadaafadda (saabuun, xaaqin) iyo caafimaadka (First Aid)' },
    { name: 'Sports & Apparel', description: 'Kubadaha iyo dareeska iskuulka' },
    { name: 'Transport', description: 'Basaska iyo baabuurta yar-yar' },
    { name: 'Catering', description: 'Maacuunta jikada iyo alaabta ceyriin' }
];

const samples = [
    // Furniture
    { name: 'Kuraasta & Miisaska Ardayda', category: 'Furniture', quantity: 300, price: 35, condition: 'Good', location: 'Fasallada 1-8', status: 'Available' },
    { name: 'Miiska Macallinka (Wooden)', category: 'Furniture', quantity: 25, price: 85, condition: 'New', location: 'Staff Room', status: 'Available' },
    { name: 'Armaajooyinka Birta (Filing Cabinets)', category: 'Furniture', quantity: 10, price: 150, condition: 'Good', location: 'Main Office', status: 'Available' },
    
    // ICT & Electronics
    { name: 'Laptop (Dell Latitude)', category: 'ICT & Electronics', quantity: 12, price: 450, condition: 'Good', location: 'Staff Room', status: 'In Use' },
    { name: 'Projectors (Epson)', category: 'ICT & Electronics', quantity: 6, price: 320, condition: 'Good', location: 'Classrooms A-F', status: 'Available' },
    { name: 'Router-ada Wi-Fi (Cisco)', category: 'ICT & Electronics', quantity: 4, price: 120, condition: 'New', location: 'Hallway', status: 'In Use' },
    { name: 'Solar Panels (200W)', category: 'ICT & Electronics', quantity: 8, price: 280, condition: 'New', location: 'Roof', status: 'Available' },
    
    // Stationery
    { name: 'Waraaqaha A4 (Carton)', category: 'Stationery', quantity: 45, price: 14, condition: 'New', location: 'Store', status: 'Available' },
    { name: 'Board Markers (Boxes)', category: 'Stationery', quantity: 100, price: 8, condition: 'New', location: 'Office', status: 'Available' },
    
    // Academic & Lab Supplies
    { name: 'Textbooks (English Grade 7)', category: 'Academic & Lab Supplies', quantity: 150, price: 10, condition: 'Good', location: 'Library', status: 'Available' },
    { name: 'Microscope (Digital)', category: 'Academic & Lab Supplies', quantity: 5, price: 180, condition: 'New', location: 'Science Lab', status: 'Available' },
    
    // Janitorial & Health
    { name: 'Saabuunta Dhulka (5L)', category: 'Janitorial & Health', quantity: 20, price: 5, condition: 'New', location: 'Janitor Room', status: 'Available' },
    { name: 'First Aid Kit (Full)', category: 'Janitorial & Health', quantity: 5, price: 45, condition: 'New', location: 'Nurse Office', status: 'Available' },
    
    // Sports
    { name: 'Kubadaha Cagta (Original)', category: 'Sports & Apparel', quantity: 15, price: 25, condition: 'Good', location: 'Sports Store', status: 'Available' },
    
    // Transport
    { name: 'Bas Iskuul (Toyota)', category: 'Transport', quantity: 2, price: 18000, condition: 'Good', location: 'Parking', status: 'In Use' }
];

const seed = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to DB');

        // 1. Clear existing categories & assets (to start fresh with these)
        await AssetCategory.deleteMany({});
        await Asset.deleteMany({});
        console.log('Cleared existing assets/categories');

        // 2. Insert Categories
        await AssetCategory.insertMany(categories);
        console.log('Inserted Categories');

        // 3. Insert Assets
        await Asset.insertMany(samples);
        console.log('Inserted Sample Assets');

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seed();
