import React from 'react';

interface ResultCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export default function ResultCard({ title, children, className = '' }: ResultCardProps) {
  return (
    <div className={`bg-white shadow-md rounded-lg p-6 mb-6 ${className}`}>
      <h3 className="text-lg font-semibold mb-3">{title}</h3>
      {children}
    </div>
  );
}
