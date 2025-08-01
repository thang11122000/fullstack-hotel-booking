import React from "react";
import type { StarRatingProps } from "../../types";
import { icons } from "../../assets";

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxRating = 5,
  size = "md",
  readonly = true,
  onRatingChange,
}) => {
  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const handleStarClick = (starRating: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(starRating);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: maxRating }, (_, index) => {
        const starRating = index + 1;
        const isFilled = starRating <= (rating || 0);

        return (
          <button
            key={index}
            type="button"
            className={`${
              readonly ? "cursor-default" : "cursor-pointer hover:scale-110"
            } transition-transform`}
            onClick={() => handleStarClick(starRating)}
            disabled={readonly}
          >
            <img
              src={isFilled ? icons.starIconFilled : icons.starIconOutlined}
              alt={`${starRating} star${starRating > 1 ? "s" : ""}`}
              className={sizeClasses[size]}
            />
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;
