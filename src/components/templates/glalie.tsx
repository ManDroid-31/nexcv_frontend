import React from "react";
import type { TemplateProps } from "../../types/template";

export const Glalie = ({ data }: TemplateProps) => {
  // Standard outer margin (not user-editable)
  const margins = {
    top: data.layout?.margins?.top ?? 40,
    bottom: data.layout?.margins?.bottom ?? 40,
    left: data.layout?.margins?.left ?? 40,
    right: data.layout?.margins?.right ?? 40
  };
  const scale = data.layout?.scale ?? 1;

  return (
    <div
      style={{
        margin: `${margins.top}px ${margins.right}px ${margins.bottom}px ${margins.left}px`,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 0,
        minWidth: 0,
      }}
    >
      <div
        className="max-w-[850px] w-full bg-white shadow-lg"
        style={{
          padding: '40px',
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
        }}
      >
        <h1>{data.personalInfo.name}</h1>
        {/* TODO: Implement the rest of the template using data */}
      </div>
    </div>
  );
};
