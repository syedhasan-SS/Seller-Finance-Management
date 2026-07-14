import { BookOpen, ArrowUpRight } from 'lucide-react';
import type { KnowledgeCenterModule as TKnowledgeCenterModule, KnowledgeTag } from '@/types/homeConfig';

const TAG_STYLE: Record<KnowledgeTag, string> = {
  'getting-started': 'bg-blue-50 text-blue-700',
  payouts: 'bg-emerald-50 text-emerald-700',
  listings: 'bg-fleek-yellow-light text-fleek-black',
  support: 'bg-gray-100 text-gray-700',
};

const TAG_LABEL: Record<KnowledgeTag, string> = {
  'getting-started': 'Getting started',
  payouts: 'Payouts',
  listings: 'Listings',
  support: 'Support',
};

export default function KnowledgeCenterModule({ module }: { module: TKnowledgeCenterModule }) {
  const { title, items } = module.data;
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-2">
        <BookOpen className="w-4 h-4 text-fleek-black" />
        <h2 className="text-base sm:text-lg font-bold text-fleek-black">{title}</h2>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 p-4 sm:p-6">
        {items.map((item) => {
          const isExternal = item.href.startsWith('http');
          return (
            <a
              key={item.id}
              href={item.href}
              {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              data-home-cta="1"
              data-home-href={item.href}
              className="block bg-white border border-gray-100 rounded-lg p-4 hover:border-fleek-yellow hover:shadow-sm transition-all group"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                {item.tag && (
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded ${TAG_STYLE[item.tag]}`}>
                    {TAG_LABEL[item.tag]}
                  </span>
                )}
                <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-fleek-black flex-shrink-0" />
              </div>
              <h3 className="text-sm font-bold text-fleek-black leading-snug mb-1">{item.title}</h3>
              <p className="text-xs text-gray-600 leading-snug">{item.summary}</p>
            </a>
          );
        })}
      </div>
    </div>
  );
}
