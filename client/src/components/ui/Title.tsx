import React from "react";
import { TitleProps } from "../../types";

const Title: React.FC<TitleProps> = ({
  align = "left",
  font = "font-playfair",
  title,
  subTitle,
}) => {
  const alignClasses = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  return (
    <div className={`${alignClasses[align]} max-w-2xl`}>
      <h2
        className={`text-3xl md:text-4xl lg:text-5xl font-medium ${font} text-gray-800 mb-4`}
      >
        {title}
      </h2>
      {subTitle && (
        <p className="text-gray-600 text-base md:text-lg leading-relaxed">
          {subTitle}
        </p>
      )}
    </div>
  );
};

export default Title;
