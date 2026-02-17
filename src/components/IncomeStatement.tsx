import { useState } from 'react';
import { ArrowLeft, Search, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';

// Sample income statement data
const incomeStatements = [
  {
    id: 'PK2NBY8TW72-2026-008',
    period: '16 Feb 2026 - 22 Feb 2026',
    releasedAmount: 110.18,
    status: 'Ready to Release',
    expectedPayoutDate: '25 Feb 2026'
  },
  {
    id: 'PK2NBY8TW72-2026-007',
    period: '09 Feb 2026 - 15 Feb 2026',
    releasedAmount: 662.45,
    status: 'Ready to Release',
    expectedPayoutDate: '18 Feb 2026'
  },
  {
    id: 'PK2NBY8TW72-2026-006',
    period: '02 Feb 2026 - 08 Feb 2026',
    releasedAmount: 449.78,
    status: 'Ready to Release',
    expectedPayoutDate: '11 Feb 2026'
  },
  {
    id: 'PK2NBY8TW72-2026-005',
    period: '26 Jan 2026 - 01 Feb 2026',
    releasedAmount: 224.86,
    status: 'Ready to Release',
    expectedPayoutDate: '04 Feb 2026'
  },
  {
    id: 'PK2NBY8TW72-2026-004',
    period: '19 Jan 2026 - 25 Jan 2026',
    releasedAmount: 309.85,
    status: 'Released',
    expectedPayoutDate: '28 Jan 2026'
  },
  {
    id: 'PK2NBY8TW72-2026-003',
    period: '12 Jan 2026 - 18 Jan 2026',
    releasedAmount: 2350.15,
    status: 'Released',
    expectedPayoutDate: '21 Jan 2026'
  },
  {
    id: 'PK2NBY8TW72-2026-002',
    period: '05 Jan 2026 - 11 Jan 2026',
    releasedAmount: 2755.95,
    status: 'Released',
    expectedPayoutDate: '14 Jan 2026'
  },
  {
    id: 'PK2NBY8TW72-2026-001',
    period: '29 Dec 2025 - 04 Jan 2026',
    releasedAmount: 1180.02,
    status: 'Released',
    expectedPayoutDate: '07 Jan 2026'
  }
];

export const IncomeStatement: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const handleBackToHome = () => {
    navigate('/dashboard');
  };

  const handleViewDetails = (statementId: string) => {
    navigate(`/income-statement/${statementId}`);
  };

  const filteredStatements = incomeStatements.filter(statement => {
    const matchesSearch = statement.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || statement.status.toLowerCase().replace(' ', '-') === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header sellerId="SEL-789" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <button onClick={handleBackToHome} className="hover:text-gray-900">
            Home
          </button>
          <span>/</span>
          <span className="text-gray-900 font-medium">My Income</span>
        </div>

        {/* Page Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Income</h1>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex gap-8">
            <button className="pb-4 text-sm font-medium text-gray-500 hover:text-gray-900">
              Income Overview
            </button>
            <button className="pb-4 text-sm font-medium text-red-600 border-b-2 border-red-600">
              Income Statement
            </button>
            <button className="pb-4 text-sm font-medium text-gray-500 hover:text-gray-900">
              Income Details
            </button>
          </nav>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-blue-900">
            Dear Seller, please note that there may be a system delay affecting the automated updates of your seller statement.
            If you notice that your statement is not up to date, kindly reach out to our Partner Support Team for assistance.{' '}
            <a href="#" className="text-blue-600 hover:underline font-medium">Contact PSC</a>
          </p>
        </div>

        {/* View Statements Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-6 py-5 border-b border-gray-100">
            <div className="flex items-center gap-2 mb-6">
              <h2 className="text-xl font-semibold text-gray-900">View Statements</h2>
              <Info className="w-4 h-4 text-gray-400" />
            </div>

            {/* Filters */}
            <div className="flex gap-4">
              <div className="flex-1 max-w-xs">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Release Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Please Select</option>
                  <option value="ready-to-release">Ready to Release</option>
                  <option value="released">Released</option>
                </select>
              </div>

              <div className="flex-1 max-w-xs">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Statement Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Statement Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Statement Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Released Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Release Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredStatements.map((statement) => (
                  <tr key={statement.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {statement.id}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {statement.period}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      PKR {statement.releasedAmount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-medium ${
                        statement.status === 'Released'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {statement.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => handleViewDetails(statement.id)}
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium text-left"
                        >
                          View Statement Details
                        </button>
                        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium text-left">
                          Print Invoice
                        </button>
                        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium text-left">
                          Download ▼
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">Items per page:</span>
              <select className="px-2 py-1 border border-gray-200 rounded text-sm">
                <option>10</option>
                <option>20</option>
                <option>50</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button className="px-3 py-1 text-sm text-gray-400 cursor-not-allowed">
                &lt; Previous
              </button>
              <button className="px-3 py-1 text-sm bg-red-600 text-white rounded">
                1
              </button>
              <button className="px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded">
                2
              </button>
              <button className="px-3 py-1 text-sm text-blue-600 hover:bg-gray-100 rounded">
                Next &gt;
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default IncomeStatement;
