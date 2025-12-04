import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { ArrowRightLeft, Calendar, TrendingUp } from 'lucide-react';
import { useMigrationHistory } from '@/hooks/useMigrationHistory';

export const MigrationSummaryCard: React.FC = () => {
  const { data: migrationEvents, isLoading } = useMigrationHistory();

  const getMigrationStats = () => {
    if (!migrationEvents?.length) {
      return {
        totalMigrations: 0,
        completedMigrations: 0,
        totalAmount: '0',
        lastMigration: null,
        completionRate: 0
      };
    }

    const completed = migrationEvents.filter(event => event.status === 'confirmed');
    const totalAmount = migrationEvents.reduce((sum, event) => {
      return sum + parseFloat(event.amount || '0');
    }, 0);

    return {
      totalMigrations: migrationEvents.length,
      completedMigrations: completed.length,
      totalAmount: totalAmount.toLocaleString('en-US', { maximumFractionDigits: 2 }),
      lastMigration: migrationEvents[0]?.created_at ? new Date(migrationEvents[0].created_at) : null,
      completionRate: migrationEvents.length > 0 ? (completed.length / migrationEvents.length) * 100 : 0
    };
  };

  const stats = getMigrationStats();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-16 mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-2 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Migration Summary
        </CardTitle>
        <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold">{stats.completedMigrations}</div>
            <Badge variant={stats.completedMigrations > 0 ? 'default' : 'secondary'}>
              {stats.completedMigrations > 0 ? 'Active' : 'No Migrations'}
            </Badge>
          </div>
          
          <CardDescription>
            {stats.totalMigrations > 0 ? (
              <>Completed {stats.completedMigrations} of {stats.totalMigrations} migrations</>
            ) : (
              <>No token migrations yet</>
            )}
          </CardDescription>

          {stats.totalMigrations > 0 && (
            <>
              <Progress value={stats.completionRate} className="h-2" />
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total Migrated:</span>
                  <span className="font-medium">{stats.totalAmount} tokens</span>
                </div>
                
                {stats.lastMigration && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>Last: {stats.lastMigration.toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};