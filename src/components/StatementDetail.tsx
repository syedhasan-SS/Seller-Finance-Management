import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download, ExternalLink } from 'lucide-react';
import Header from './Header';
import { useSeller } from '../contexts/SellerContext';
import { getSellerStatements } from '../services/api-client';
import { LoadingSpinner } from './LoadingSpinner';

interface Statement {
  id: string;
  period: string;
  releasedAmount: number;
  status: string;
  expectedPayoutDate: string;
  pdfUrl?: string | null;
}

export const StatementDetail: React.FC = () => {
  const navigate = useNavigate();
  const { statementId } = useParams<{ statementId: string }>();
  const { sellerId, vendorHandle } = useSeller();
  const [statement, setStatement] = useState<Statement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (statementId && (sellerId || vendorHandle)) {
      loadStatement();
    }
  }, [statementId, sellerId, vendorHandle]);

  async function loadStatement() {
    try {
      setLoading(true);
      setError(null);
      const id = vendorHandle || sellerId || '';
      const statements: Statement[] = await getSellerStatements(id);
      const found = statements.find(s => s.id === statementId);
      if (!found) {
        setError('Statement not found');
      } else {
        setStatement(found);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load statement');
    } finally {
      setLoading(false);
    }
  }

  const handleBack = () => navigate('/income-statement');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !statement) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header sellerId={sellerId || vendorHandle || ''} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button onClick={handleBack} className="flex items-center gap-2 text-gray-600 hover:text-fleek-black mb-6 font-medium transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to My Income
          </button>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center">
            <p className="text-gray-500 text-sm mb-4">{error || 'Statement not found'}</p>
            <button onClick={handleBack} className="text-sm font-bold text-fleek-black underline underline-offset-2">
              Back to Income Statement
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header sellerId={sellerId || vendorHandle || ''} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <button onClick={() => navigate('/dashboard')} className="hover:text-fleek-black transition-colors">Home</button>
          <span>/</span>
          <button onClick={handleBack} className="hover:text-fleek-black transition-colors">My Income</button>
          <span>/</span>
          <span className="text-fleek-black font-semibold">Statement Detail</span>
        </div>

        <h1 className="text-3xl font-extrabold text-fleek-black tracking-tight mb-8">Statement Detail</h1>

        {/* Statement Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-fleek-black">Statement Overview</h2>
            {statement.pdfUrl ? (
              <a
                href={statement.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-fleek-yellow text-fleek-black font-bold rounded-lg hover:bg-fleek-yellow-dark transition-colors text-sm"
              >
                <Download className="w-4 h-4" />
                Download PDF
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>
            ) : (
              <button
                disabled
                className="inline-flex items-center gap-2 px-4 py-2 border-2 border-gray-200 text-gray-400 font-bold rounded-lg text-sm cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
            )}
          </div>

          {/* Amount */}
          <div className="mb-6">
            <p className="text-4xl font-extrabold text-fleek-black mb-1">
              £{statement.releasedAmount.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Released Amount (GBP)</p>
          </div>

          {/* Metadata grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5 border-t border-gray-100">
            <div>
              <p className="text-xs text-gray-400 mb-1">Payout ID</p>
              <p className="text-sm font-bold text-fleek-black">{statement.id}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Payout Date</p>
              <p className="text-sm font-bold text-fleek-black">{statement.period}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Status</p>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${
                statement.status === 'Released'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-fleek-yellow-light text-fleek-black border-fleek-yellow'
              }`}>
                {statement.status}
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Expected Payout Date</p>
              <p className="text-sm font-bold text-fleek-black">{statement.expectedPayoutDate || '—'}</p>
            </div>
          </div>
        </div>

        {/* Payout Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-xl font-bold text-fleek-black">Payout Summary</h2>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Item</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Amount (GBP)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-50">
                <td className="px-6 py-4 text-sm text-gray-600">Gross Payout (before commission)</td>
                <td className="px-6 py-4 text-sm font-medium text-fleek-black text-right">
                  £{(statement.releasedAmount / 0.82).toFixed(2)}
                </td>
              </tr>
              <tr className="border-b border-gray-50">
                <td className="px-6 py-4 text-sm text-gray-600">Fleek Commission (18%)</td>
                <td className="px-6 py-4 text-sm font-medium text-red-600 text-right">
                  -£{(statement.releasedAmount / 0.82 * 0.18).toFixed(2)}
                </td>
              </tr>
              <tr className="bg-fleek-yellow-light">
                <td className="px-6 py-4 text-sm font-bold text-fleek-black">Net Payout to Vendor</td>
                <td className="px-6 py-4 text-sm font-bold text-fleek-black text-right">
                  £{statement.releasedAmount.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* PDF CTA */}
        {statement.pdfUrl && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-fleek-black mb-0.5">Full Order Breakdown</p>
              <p className="text-xs text-gray-500">View the detailed per-order breakdown in the payout PDF</p>
            </div>
            <a
              href={statement.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-fleek-black text-white font-bold rounded-lg hover:bg-gray-800 transition-colors text-sm whitespace-nowrap"
            >
              Open PDF
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}
      </main>
    </div>
  );
};

export default StatementDetail;
