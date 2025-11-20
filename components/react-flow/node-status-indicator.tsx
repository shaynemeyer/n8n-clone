import { type ReactNode } from 'react';
import { LoaderCircle } from 'lucide-react';

import { cn } from '@/lib/utils';

export type NodeStatus = 'loading' | 'success' | 'error' | 'initial';

export type NodeStatusVariant = 'overlay' | 'border';

export type NodeStatusIndicatorProps = {
  status?: NodeStatus;
  variant?: NodeStatusVariant;
  children: ReactNode;
  className?: string;
};

export const SpinnerLoadingIndicator = ({
  children,
}: {
  children: ReactNode;
}) => {
  return (
    <div className="relative">
      <StatusBorder className="border-blue-700/40">{children}</StatusBorder>

      <div className="bg-background/50 absolute inset-0 z-50 rounded-[9px] backdrop-blur-xs" />
      <div className="absolute inset-0 z-50">
        <span className="absolute top-[calc(50%-1.25rem)] left-[calc(50%-1.25rem)] inline-block h-10 w-10 animate-ping rounded-full bg-blue-700/20" />

        <LoaderCircle className="absolute top-[calc(50%-0.75rem)] left-[calc(50%-0.75rem)] size-6 animate-spin text-blue-700" />
      </div>
    </div>
  );
};

export const BorderLoadingIndicator = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div className="relative">
      <div
        className={cn(
          'pointer-events-none absolute -inset-0.5 overflow-hidden',
          className
        )}
      >
        <div
          className="absolute left-1/2 top-1/2 size-[140%] -translate-x-1/2 -translate-y-1/2 animate-spin rounded-full"
          style={{
            background:
              'conic-gradient(from 0deg at 50% 50%, rgba(59, 130, 246, 0.5) 0deg, rgba(59, 130, 246, 0) 360deg)',
            animationDuration: '2s',
          }}
        />
      </div>
      {children}
    </div>
  );
};

const StatusBorder = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <>
      <div
        className={cn(
          'absolute -top-0.5 -left-0.5 h-[calc(100%+4px)] w-[calc(100%+4px)] rounded-md border-3',
          className
        )}
      />
      {children}
    </>
  );
};

export const NodeStatusIndicator = ({
  status,
  variant = 'border',
  children,
  className,
}: NodeStatusIndicatorProps) => {
  switch (status) {
    case 'loading':
      switch (variant) {
        case 'overlay':
          return <SpinnerLoadingIndicator>{children}</SpinnerLoadingIndicator>;
        case 'border':
          return (
            <BorderLoadingIndicator className={className}>
              {children}
            </BorderLoadingIndicator>
          );
        default:
          return <>{children}</>;
      }
    case 'success':
      return (
        <StatusBorder className={cn('border-green-700/50', className)}>
          {children}
        </StatusBorder>
      );
    case 'error':
      return (
        <StatusBorder className={cn('border-red-700/50', className)}>
          {children}
        </StatusBorder>
      );
    default:
      return <>{children}</>;
  }
};
