import React from 'react';
import StatsCard from '@/components/ui/StatsCard';
import { BookOpen, Calendar, Users } from 'lucide-react';

interface AdminStatsGridProps {
  coursesCount: number;
  sessionsCount: number;
  parentsCount: number;
}

export default function AdminStatsGrid({ coursesCount, sessionsCount, parentsCount }: AdminStatsGridProps) {
  return (
    <div className="grid-3" style={{ marginBottom: '2.5rem' }}>
      <StatsCard 
        label="Total Courses" 
        value={coursesCount} 
        icon={BookOpen} 
        iconColor="hsl(var(--accent-purple))" 
      />
      <StatsCard 
        label="Scheduled Classes" 
        value={sessionsCount} 
        icon={Calendar} 
        iconColor="hsl(var(--accent-pink))" 
      />
      <StatsCard 
        label="Active Parents" 
        value={parentsCount} 
        icon={Users} 
        iconColor="hsl(var(--accent-indigo))" 
      />
    </div>
  );
}
