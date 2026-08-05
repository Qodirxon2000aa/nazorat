import { Router } from 'express';
import { getBranches, getEmployees, getRatings } from '../dataManager.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const { branchId, period, startDate, endDate } = req.query;

    const branches = await getBranches();
    const employees = await getEmployees(branchId ? { branchId } : {});
    let ratings = await getRatings(branchId ? { branchId } : {});

    // Apply period filtering to ratings if period is supplied
    const now = new Date();
    if (period === 'bugun') {
      const todayStr = now.toISOString().split('T')[0];
      ratings = ratings.filter(r => r.date === todayStr);
    } else if (period === 'kecha') {
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      const yStr = y.toISOString().split('T')[0];
      ratings = ratings.filter(r => r.date === yStr);
    } else if (period === '7kun') {
      const d = new Date(now);
      d.setDate(d.getDate() - 7);
      ratings = ratings.filter(r => new Date(r.date) >= d);
    } else if (period === '30kun') {
      const d = new Date(now);
      d.setDate(d.getDate() - 30);
      ratings = ratings.filter(r => new Date(r.date) >= d);
    } else if (period === 'ushbu_oy') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      ratings = ratings.filter(r => new Date(r.date) >= startOfMonth);
    } else if (period === 'otgan_oy') {
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      ratings = ratings.filter(r => {
        const d = new Date(r.date);
        return d >= startOfLastMonth && d <= endOfLastMonth;
      });
    } else if (period === 'ushbu_yil') {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      ratings = ratings.filter(r => new Date(r.date) >= startOfYear);
    } else if (period === 'custom' && startDate && endDate) {
      const s = new Date(startDate);
      const e = new Date(endDate);
      ratings = ratings.filter(r => {
        const d = new Date(r.date);
        return d >= s && d <= e;
      });
    }

    const todayStr = now.toISOString().split('T')[0];
    const todayRatings = ratings.filter(r => r.date === todayStr);

    let totalStars = 0;
    ratings.forEach(r => { totalStars += Number(r.stars || 0); });
    const overallAverageRating = ratings.length > 0 ? Number((totalStars / ratings.length).toFixed(1)) : 0;

    const sortedEmployees = [...employees].map(e => {
      const empRatings = ratings.filter(r => String(r.employeeId) === String(e.id));
      const totalPoints = empRatings.reduce((sum, r) => sum + Number(r.stars || 0), 0);
      const averageRating = empRatings.length > 0 ? Number((totalPoints / empRatings.length).toFixed(1)) : 0;
      return { ...e, averageRating, totalRatingsCount: empRatings.length };
    }).sort((a, b) => b.averageRating - a.averageRating);
    const topEmployeeObj = sortedEmployees.length > 0 && sortedEmployees[0].averageRating > 0 ? sortedEmployees[0] : null;
    const bottomEmployeeObj = sortedEmployees.length > 0 && sortedEmployees[sortedEmployees.length - 1].averageRating > 0 ? sortedEmployees[sortedEmployees.length - 1] : null;

    const branchRatingsMap = {};
    branches.forEach(b => {
      branchRatingsMap[String(b.id)] = { name: b.name, totalStars: 0, count: 0, averageRating: 0 };
    });

    ratings.forEach(r => {
      const bKey = String(r.branchId);
      if (branchRatingsMap[bKey]) {
        branchRatingsMap[bKey].totalStars += Number(r.stars || 0);
        branchRatingsMap[bKey].count += 1;
      }
    });

    const branchRankings = Object.values(branchRatingsMap).map(b => {
      b.averageRating = b.count > 0 ? Number((b.totalStars / b.count).toFixed(1)) : 0;
      return b;
    }).sort((a, b) => b.averageRating - a.averageRating);

    const activeBranches = branchRankings.filter(b => b.averageRating > 0);
    const topBranchObj = activeBranches.length > 0 ? activeBranches[0] : null;
    const weakestBranchObj = activeBranches.length > 0 ? activeBranches[activeBranches.length - 1] : null;

    const distributionMap = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    ratings.forEach(r => {
      const s = Number(r.stars);
      if (distributionMap[s] !== undefined) distributionMap[s]++;
    });

    const distributionData = [
      { name: '5 yulduz', count: distributionMap[5] },
      { name: '4 yulduz', count: distributionMap[4] },
      { name: '3 yulduz', count: distributionMap[3] },
      { name: '2 yulduz', count: distributionMap[2] },
      { name: '1 yulduz', count: distributionMap[1] }
    ];

    const topPerformers = sortedEmployees.slice(0, 10).map(e => ({
      id: String(e.id),
      name: `${e.firstName || ''} ${e.lastName || ''}`.trim() || e.name || 'Xodim',
      branch: e.branchName || 'Filial',
      averageRating: e.averageRating || 0,
      ratingCount: e.totalRatingsCount || 0
    }));

    const monthlyMap = {};
    ratings.forEach(r => {
      const month = (r.date || '').substring(0, 7) || '2026-08';
      if (!monthlyMap[month]) monthlyMap[month] = { total: 0, count: 0 };
      monthlyMap[month].total += Number(r.stars || 0);
      monthlyMap[month].count += 1;
    });

    const monthlyChartData = Object.keys(monthlyMap).sort().map(month => ({
      month,
      rating: Number((monthlyMap[month].total / monthlyMap[month].count).toFixed(1))
    }));

    const cumulativePointsLeaderboard = employees.map(e => {
      const empRatings = ratings.filter(r => String(r.employeeId) === String(e.id));
      const totalPoints = empRatings.reduce((sum, r) => sum + Number(r.stars || 0), 0);
      const averageRating = empRatings.length > 0 ? Number((totalPoints / empRatings.length).toFixed(1)) : 0;
      return {
        id: String(e.id),
        name: `${e.firstName || ''} ${e.lastName || ''}`.trim() || e.name || 'Xodim',
        position: e.position || 'Xodim',
        branch: e.branchName || 'Filial',
        totalPoints,
        totalRatingsCount: empRatings.length,
        averageRating
      };
    }).sort((a, b) => b.totalPoints - a.totalPoints);

    return res.json({
      overview: {
        totalBranches: branches.length,
        totalEmployees: employees.length,
        todayRatingsCount: todayRatings.length,
        todayActiveUsers: employees.filter(e => e.status === 'Faol').length || 1,
        overallAverageRating,
        topEmployee: topEmployeeObj ? { name: `${topEmployeeObj.firstName || ''} ${topEmployeeObj.lastName || ''}`.trim(), branch: topEmployeeObj.branchName, rating: topEmployeeObj.averageRating } : null,
        bottomEmployee: bottomEmployeeObj ? { name: `${bottomEmployeeObj.firstName || ''} ${bottomEmployeeObj.lastName || ''}`.trim(), branch: bottomEmployeeObj.branchName, rating: bottomEmployeeObj.averageRating } : null,
        topBranch: topBranchObj ? { name: topBranchObj.name, rating: topBranchObj.averageRating } : null,
        weakestBranch: weakestBranchObj ? { name: weakestBranchObj.name, rating: weakestBranchObj.averageRating } : null,
        pendingRatingsCount: Math.max(0, employees.length - todayRatings.length)
      },
      branchRankings,
      ratingTrends: [],
      distributionData,
      topPerformers,
      cumulativePointsLeaderboard,
      monthlyChartData
    });

  } catch (err) {
    console.error('Stats endpoint error:', err);
    return res.status(500).json({ error: 'Statistika yuklashda xatolik' });
  }
});

export default router;
