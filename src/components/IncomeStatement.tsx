import { useState, useEffect } from 'react';
import { Search, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import { useSeller } from '../contexts/SellerContext';
import { getVendorId } from '../services/api-client';
import { getSellerStatements } from '../services/api-client';
import { LoadingSpinner } from './LoadingSpinner';

interface Statement {
  id: string;
  period: string;
  releasedAmount: number;
  status: string;
  expectedPayoutDate: string;
}

export const IncomeStatement: React.FC = () => {
  const navigate = useNavigate();
  const { sellerId, vendorHandle } = useSeller();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [statements, setStatements] = useState<Statement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sellerId || vendorHandle) {
      loadStatements();
    }
  }, [sellerId, vendorHandle]);

  async function loadStatements() {
    try {
      setLoading(true);
      setError(null);

      let vendorId = sellerId || vendorHandle || '';
      if (/[a-z]/i.test(vendorId)) {
        vendorId = await getVendorId(vendorId);
      }

      const data = await getSellerStatements(vendorId);
      setStatements(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load statements');
    } finally {
      setLoading(false);
    }
  }

  const handleBackToHome = () => {
    navigate('/dashboard');
  };

  const handleViewDetails = (statementId: string) => {
    navigate(`/income-statement/${statementId}`);
  };

  const filteredStatements = statements.filter(statement => {
    const matchesSearch = statement.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || statement.status.toLowerCase().replace(/ /g, '-') === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header sellerId={sellerId || vendorHandle || ''} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <button onClick={handleBackToHome} className="hover:text-fleek-black font-medium transition-colors">
            Home
          </button>
          <span>/</span>
          <span className="text-fleek-black font-semibold">My Income</span>
        </div>

        {/* Page Title */}
        <h1 className="text-3xl font-extrabold text-fleek-black mb-8 tracking-tight">My Income</h1>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex gap-8">
            <button className="pb-4 text-sm font-semibold text-gray-400 hover:text-fleek-black transition-colors">
              Income Overview
            </button>
            <button className="pb-4 text-sm font-bold text-fleek-black border-b-2 border-fleek-yellow">
              Income Statement
            </button>
            <button className="pb-4 text-sm font-semibold text-gray-400 hover:text-fleek-black transition-colors">
              Income Details
            </button>
          </nav>
        </div>

        {/* Info Banner */}
        <div className="bg-fleek-yellow-light border border-fleek-yellow rounded-lg p-4 mb-6 flex items-start gap-3">
          <Info className="w-5 h-5 text-fleek-black mt-0.5 flex-shrink-0" />
          <p className="text-sm text-fleek-black">
            Dear Seller, please note that there may be a system delay affecting the automated updates of your seller statement.
            If you notice that your statement is not up to date, kindly reach out to our Partner Support Team for assistance.{' '}
            <a href="#" className="font-bold underline hover:opacity-70 transition-opacity">Contact PSC</a>
          </p>
        </div>

        {/* View Statements Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-6 py-5 border-b border-gray-100">
            <div className="flex items-center gap-2 mb-6">
              <h2 className="text-xl font-bold text-fleek-black">View Statements</h2>
              <Info className="w-4 h-4 text-gray-400" />
            </div>

            {/* Filters */}
            <div className="flex gap-4">
              <div className="flex-1 max-w-xs">
                <label className="block text-sm font-semibold text-fleek-black mb-2">
                  Release Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-fleek-yellow text-sm font-medium transition"
                >
                  <option value="all">Please Select</option>
                  <option value="ready-to-release">Ready to Release</option>
                  <option value="released">Released</option>
                </select>
              </div>

              <div className="flex-1 max-w-xs">
                <label className="block text-sm font-semibold text-fleek-black mb-2">
                  Payout ID
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 pr-10 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-fleek-yellow text-sm font-medium transition"
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
                  className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-fleek-black transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <LoadingSpinner size="md" />
            </div>
          ) : error ? (
            <div className="px-6 py-10 text-center text-sm text-red-600">{error}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Payout ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Statement Period
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Released Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Release Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-50">
                  {filteredStatements.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-500">
                        No statements found
                      </td>
                    </tr>
                  ) : filteredStatements.map((statement) => (
                    <tr key={statement.id} className="hover:bg-fleek-yellow-light transition-colors">
                      <td className="px-6 py-4 text-sm font-semibold text-fleek-black">
                        {statement.id}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {statement.period}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-fleek-black">
                        £{statement.releasedAmount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold border ${
                          statement.status === 'Released'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-fleek-yellow-light text-fleek-black border-fleek-yellow'
                        }`}>
                          {statement.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => handleViewDetails(statement.id)}
                            className="text-sm font-semibold text-fleek-black hover:text-fleek-yellow-dark text-left underline underline-offset-2 transition-colors"
                          >
                            View Statement Details
                          </button>
                          <button className="text-sm font-semibold text-fleek-black hover:text-fleek-yellow-dark text-left underline underline-offset-2 transition-colors">
                            Download ▼
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 font-medium">Items per page:</span>
              <select className="px-2 py-1 border-2 border-gray-200 rounded text-sm font-medium focus:outline-none focus:border-fleek-yellow">
                <option>10</option>
                <option>20</option>
                <option>50</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button className="px-3 py-1 text-sm text-gray-300 cursor-not-allowed font-medium">
                &lt; Previous
              </button>
              <button className="px-3 py-1 text-sm bg-fleek-yellow text-fleek-black font-bold rounded">
                1
              </button>
              <button className="px-3 py-1 text-sm text-fleek-black font-semibold hover:bg-gray-100 rounded transition-colors">
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
