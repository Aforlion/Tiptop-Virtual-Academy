import React from 'react';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return <div className="main-wrapper" style={{ flexDirection: 'column' }}>{children}</div>;
}
