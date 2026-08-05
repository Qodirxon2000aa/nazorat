import mongoose from 'mongoose';
import Branch from './models/Branch.js';
import Employee from './models/Employee.js';
import Rating from './models/Rating.js';

const branchesData = [
  { name: 'Toshkent Bosh Filiali', address: 'Toshkent sh., Yunusobod tumani' },
  { name: 'Samarqand Filiali', address: 'Samarqand sh., Registon ko\'chasi' },
  { name: 'Buxoro Filiali', address: 'Buxoro sh., Qadimiy markaz' },
  { name: 'Farg\'ona Filiali', address: 'Farg\'ona sh., Markaziy ko\'cha' }
];

const employeeNames = [
  ['Ali', 'Valiyev'], ['Aziz', 'Karimov'], ['Bekzod', 'Tursunov'], ['Davron', 'Qosimov'],
  ['Eldor', 'Safarov'], ['Farrux', 'Nazarov'], ['G\'ayrat', 'Murodov'], ['Hasan', 'Olimov'],
  ['Ilhom', 'Raimov'], ['Jasur', 'Eshmatov'], ['Kamron', 'Tolipov'], ['Laziz', 'Usmonov'],
  ['Mansur', 'Yunusov'], ['Nodir', 'Shokirov'], ['Oybek', 'Zokirov'], ['Pulat', 'Rasulov'],
  ['Rustam', 'Qodirov'], ['Sanjar', 'Toshmatov'], ['Timur', 'Ismoilov'], ['Umid', 'Rahimov']
];

const positions = ['Sotuvchi menejer', 'Kassir', 'Omborchi', 'Katta menejer', 'Filial rahbari o\'rinbosari'];
const avatars = [
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
  'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150',
  'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=150'
];

const comments = [
  'Ajoyib xizmat ko\'rsatdi!',
  'Mijozlar bilan yaxshi muomala qildi.',
  'Biroz sekin, lekin ishini yaxshi bajaradi.',
  'Juda faol va tezkor xodim.',
  'Umuman olganda yomon emas, lekin o\'sish uchun joy bor.'
];

async function seed() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/filiallar_db');
    console.log('MongoDB connected for seeding...');

    // Clear old data
    await Branch.deleteMany({});
    await Employee.deleteMany({});
    await Rating.deleteMany({});

    console.log('Old data cleared.');

    // 1. Create Branches
    const createdBranches = await Branch.insertMany(branchesData);
    console.log(`Created ${createdBranches.length} branches.`);

    // 2. Create Employees
    let employeesToInsert = [];
    for (let i = 0; i < 20; i++) {
      const branch = createdBranches[i % 4];
      const namePair = employeeNames[i];
      employeesToInsert.push({
        firstName: namePair[0],
        lastName: namePair[1],
        phone: `+998 90 100 00 ${i.toString().padStart(2, '0')}`,
        position: positions[i % 5],
        branchId: branch._id.toString(),
        branchName: branch.name,
        avatar: avatars[i % 5],
        status: 'Faol',
        averageRating: 0,
        totalRatingsCount: 0
      });
    }

    const createdEmployees = await Employee.insertMany(employeesToInsert);
    console.log(`Created ${createdEmployees.length} employees.`);

    // 3. Create Ratings
    let ratingsToInsert = [];
    for (let emp of createdEmployees) {
      // Create 3-7 random ratings for each employee
      const numRatings = Math.floor(Math.random() * 5) + 3;
      let totalStars = 0;

      for (let j = 0; j < numRatings; j++) {
        const stars = Math.floor(Math.random() * 5) + 1; // 1 to 5
        totalStars += stars;
        ratingsToInsert.push({
          employeeId: emp._id.toString(),
          employeeName: `${emp.firstName} ${emp.lastName}`,
          branchId: emp.branchId,
          branchName: emp.branchName,
          ratedById: 'admin_id_placeholder', // Hardcoded admin id doesn't strictly matter for display unless checked
          ratedByName: 'Super Admin',
          stars: stars,
          comment: comments[Math.floor(Math.random() * comments.length)],
          date: new Date(Date.now() - Math.floor(Math.random() * 10) * 86400000).toISOString().split('T')[0] // Random date within last 10 days
        });
      }

      // Update employee stats
      const avg = totalStars / numRatings;
      await Employee.updateOne(
        { _id: emp._id },
        { 
          $set: { 
            averageRating: parseFloat(avg.toFixed(1)), 
            totalRatingsCount: numRatings 
          }
        }
      );
    }

    await Rating.insertMany(ratingsToInsert);
    console.log(`Created ${ratingsToInsert.length} ratings and updated employee statistics.`);

    console.log('Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
}

seed();
