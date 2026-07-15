"use client";

import { useState } from "react";

type TagFilterProps = {
  controlId: string;
  label: string;
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
};

export function TagFilter({
  controlId,
  label,
  options,
  selected,
  onSelect
}: TagFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasOverflow = options.length > 6;

  return (
    <div className={isExpanded ? "tahoe-filter-picker is-expanded" : "tahoe-filter-picker"}>
      <div
        aria-label={label}
        className="tahoe-filter-chips"
        id={controlId}
        role="group"
      >
        {options.map((option) => {
          const isActive = selected === option;

          return (
            <button
              aria-pressed={isActive}
              className={isActive ? "tahoe-segment is-active" : "tahoe-segment"}
              key={option}
              onClick={() => onSelect(option)}
              type="button"
            >
              {option}
            </button>
          );
        })}
      </div>
      {hasOverflow ? (
        <button
          aria-controls={controlId}
          aria-expanded={isExpanded}
          className="tahoe-segment tahoe-filter-toggle"
          onClick={() => setIsExpanded((expanded) => !expanded)}
          type="button"
        >
          <span>{isExpanded ? "收起标签" : "展开标签"}</span>
          <svg
            aria-hidden="true"
            className={isExpanded ? "is-up" : ""}
            fill="none"
            height="14"
            viewBox="0 0 24 24"
            width="14"
          >
            <path d="m6 9 6 6 6-6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </svg>
        </button>
      ) : null}
    </div>
  );
}
