import React from 'react';
import { Loader2, MessageSquare, Star } from 'lucide-react';
import { useClientRatings } from '../../hooks/useClientRatings';

export default function ClientRatings() {
  const { ratings, loading, error } = useClientRatings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-extrabold text-slate-800">Mes avis</h1>
        <div className="w-16 h-1 bg-amber-500 rounded-full mt-2"></div>
        <p className="text-base text-slate-500 mt-3">Retrouvez les évaluations laissées après vos séjours.</p>
      </div>

      {error && <div className="rounded-xl bg-red-50 p-4 text-red-700">{error}</div>}

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
        </div>
      ) : (
        <div className="space-y-4">
          {ratings.map((item) => (
            <article key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden p-6">
              <div className="flex items-center justify-between">
                <p className="font-bold text-slate-900">{item.reservation?.room?.name || 'Séjour'}</p>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <Star
                      key={value}
                      className={`h-4 w-4 ${
                        value <= item.rating
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              {item.comment && (
                <p className="mt-4 flex gap-2 text-sm text-slate-600">
                  <MessageSquare className="h-4 w-4 shrink-0 text-amber-500" />
                  {item.comment}
                </p>
              )}
            </article>
          ))}
          {!ratings.length && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-4">
                <Star className="w-10 h-10 text-amber-400 fill-amber-400" />
              </div>
              <p className="text-slate-500">Vous n'avez pas encore laissé d'avis.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
