import React from 'react';
import { ArrowLeft, Download, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { samplePayoutData } from '../data/sampleData';
import Header from './Header';

export const IncomeStatement: React.FC = () => {
  const navigate = useNavigate();
  const payoutData = samplePayoutData;

  const handleBackToHome = () => {
    navigate('/dashboard');
  };

  // Calculate income statement data
  const currentMonthRevenue = payoutData.totalAmount;
  const previousMonthsRevenue = payoutData.payoutHistory.reduce((sum, p) => sum + p.amount, 0);
  const totalRevenue = currentMonthRevenue + previousMonthsRevenue;

  // Income Statement Items
  const incomeItems = [
    {
      category: 'Revenue',
      items: [
        { description: 'Product Sales', amount: totalRevenue * 0.85, period: 'Feb 2026' },
        { description: 'Shipping Income', amount: totalRevenue * 0.10, period: 'Feb 2026' },
        { description: 'Other Income', amount: totalRevenue * 0.05, period: 'Feb 2026' },
      ],
      total: totalRevenue,
      isRevenue: true
    },
    {
      category: 'Cost of Goods Sold',
      items: [
        { description: 'Product Costs', amount: totalRevenue * 0.45, period: 'Feb 2026' },
        { description: 'Shipping Costs', amount: totalRevenue * 0.08, period: 'Feb 2026' },
        { description: 'Packaging', amount: totalRevenue * 0.02, period: 'Feb 2026' },
      ],
      total: totalRevenue * 0.55,
      isRevenue: false
    },
    {
      category: 'Operating Expenses',
      items: [
        { description: 'Platform Fees', amount: totalRevenue * 0.12, period: 'Feb 2026' },
        { description: 'Marketing', amount: totalRevenue * 0.05, period: 'Feb 2026' },
        { description: 'Customer Support', amount: totalRevenue * 0.03, period: 'Feb 2026' },
      ],
      total: totalRevenue * 0.20,
      isRevenue: false
    }
  ];

  const grossProfit = totalRevenue - (totalRevenue * 0.55);
  const operatingIncome = grossProfit - (totalRevenue * 0.20);
  const netIncome = operatingIncome;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header sellerId={payoutData.sellerId} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={handleBackToHome}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Dashboard</span>
        </button>

        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Income Statement</h1>
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">Period: February 2026</span>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Download className="w-4 h-4" />
            <span className="text-sm font-medium">Export PDF</span>
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <p className="text-sm text-gray-500 mb-2">Total Revenue</p>
            <p className="text-2xl font-bold text-gray-900 mb-1">
              ${totalRevenue.toFixed(2)}
            </p>
            <p className="text-xs text-emerald-600 font-medium">+12.5% from last month</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <p className="text-sm text-gray-500 mb-2">Gross Profit</p>
            <p className="text-2xl font-bold text-gray-900 mb-1">
              ${grossProfit.toFixed(2)}
            </p>
            <p className="text-xs text-gray-600">{((grossProfit / totalRevenue) * 100).toFixed(1)}% margin</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <p className="text-sm text-gray-500 mb-2">Operating Income</p>
            <p className="text-2xl font-bold text-gray-900 mb-1">
              ${operatingIncome.toFixed(2)}
            </p>
            <p className="text-xs text-gray-600">{((operatingIncome / totalRevenue) * 100).toFixed(1)}% margin</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <p className="text-sm text-gray-500 mb-2">Net Income</p>
            <p className="text-2xl font-bold text-emerald-600 mb-1">
              ${netIncome.toFixed(2)}
            </p>
            <p className="text-xs text-emerald-600 font-medium">+8.3% from last month</p>
          </div>
        </div>

        {/* Detailed Income Statement */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900">Detailed Statement</h2>
          </div>

          <div className="p-6">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Description</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Period</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
                </tr>
              </thead>
              <tbody>
                {incomeItems.map((section, sectionIdx) => (
                  <React.Fragment key={sectionIdx}>
                    {/* Category Header */}
                    <tr className="bg-gray-50">
                      <td colSpan={3} className="py-3 px-4">
                        <span className="text-sm font-bold text-gray-900">{section.category}</span>
                      </td>
                    </tr>

                    {/* Category Items */}
                    {section.items.map((item, itemIdx) => (
                      <tr key={itemIdx} className="border-b border-gray-100">
                        <td className="py-3 px-4 pl-8 text-sm text-gray-700">{item.description}</td>
                        <td className="py-3 px-4 text-sm text-gray-500">{item.period}</td>
                        <td className="py-3 px-4 text-sm text-gray-900 text-right font-medium">
                          ${item.amount.toFixed(2)}
                        </td>
                      </tr>
                    ))}

                    {/* Category Total */}
                    <tr className="border-b-2 border-gray-200">
                      <td className="py-3 px-4 text-sm font-semibold text-gray-900">
                        Total {section.category}
                      </td>
                      <td className="py-3 px-4"></td>
                      <td className="py-3 px-4 text-sm font-bold text-gray-900 text-right">
                        ${section.total.toFixed(2)}
                      </td>
                    </tr>
                  </React.Fragment>
                ))}

                {/* Gross Profit */}
                <tr className="bg-blue-50 border-b-2 border-blue-200">
                  <td className="py-4 px-4 text-base font-bold text-blue-900">Gross Profit</td>
                  <td className="py-4 px-4"></td>
                  <td className="py-4 px-4 text-base font-bold text-blue-900 text-right">
                    ${grossProfit.toFixed(2)}
                  </td>
                </tr>

                {/* Operating Income */}
                <tr className="bg-emerald-50 border-b-2 border-emerald-200">
                  <td className="py-4 px-4 text-base font-bold text-emerald-900">Operating Income</td>
                  <td className="py-4 px-4"></td>
                  <td className="py-4 px-4 text-base font-bold text-emerald-900 text-right">
                    ${operatingIncome.toFixed(2)}
                  </td>
                </tr>

                {/* Net Income */}
                <tr className="bg-emerald-100">
                  <td className="py-4 px-4 text-lg font-bold text-emerald-900">Net Income</td>
                  <td className="py-4 px-4"></td>
                  <td className="py-4 px-4 text-lg font-bold text-emerald-900 text-right">
                    ${netIncome.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Profitability Ratios</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Gross Margin</span>
                <span className="text-sm font-semibold text-gray-900">
                  {((grossProfit / totalRevenue) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Operating Margin</span>
                <span className="text-sm font-semibold text-gray-900">
                  {((operatingIncome / totalRevenue) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Net Margin</span>
                <span className="text-sm font-semibold text-emerald-600">
                  {((netIncome / totalRevenue) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Cost Structure</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">COGS</span>
                <span className="text-sm font-semibold text-gray-900">
                  {((totalRevenue * 0.55 / totalRevenue) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Operating Expenses</span>
                <span className="text-sm font-semibold text-gray-900">
                  {((totalRevenue * 0.20 / totalRevenue) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Costs</span>
                <span className="text-sm font-semibold text-gray-900">
                  {(((totalRevenue * 0.55 + totalRevenue * 0.20) / totalRevenue) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Month Overview</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Orders</span>
                <span className="text-sm font-semibold text-gray-900">
                  {payoutData.orders.length + payoutData.payoutHistory.reduce((sum, p) => sum + p.orderCount, 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Avg Order Value</span>
                <span className="text-sm font-semibold text-gray-900">
                  ${(totalRevenue / (payoutData.orders.length + payoutData.payoutHistory.reduce((sum, p) => sum + p.orderCount, 0))).toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Growth Rate</span>
                <span className="text-sm font-semibold text-emerald-600">+12.5%</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default IncomeStatement;
