import React, { useState } from 'react';
import { Star } from 'lucide-react';

export const StarRating = ({
  value,
  onChange,
  readonly = false,
  size = 'md',
  showLabel = false,
}) => {
  const [hoverVal, setHoverVal] = useState(null);

  const starSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
  };

  const labels = {
    1: '1 ⭐ Juda yomon',
    2: '2 ⭐ Yomon',
    3: '3 ⭐ O\'rtacha',
    4: '4 ⭐ Yaxshi',
    5: '5 ⭐ A\'lo',
  };

  const activeValue = hoverVal !== null ? hoverVal : value;

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => !readonly && onChange && onChange(star)}
            onMouseEnter={() => !readonly && setHoverVal(star)}
            onMouseLeave={() => !readonly && setHoverVal(null)}
            className={`${
              readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
            } transition-transform focus:outline-none`}
            title={labels[star]}
          >
            <Star
              className={`${starSizes[size]} ${
                star <= activeValue
                  ? 'fill-amber-400 text-amber-400 drop-shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 dark:text-slate-600'
              }`}
            />
          </button>
        ))}
      </div>

      {showLabel && activeValue > 0 && (
        <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
          {labels[activeValue]}
        </span>
      )}
    </div>
  );
};
