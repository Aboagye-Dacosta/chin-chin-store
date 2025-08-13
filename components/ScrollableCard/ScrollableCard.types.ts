export interface ScrollableCardProps {
  children: React.ReactNode;
  className?: string;
  maxHeight?: string;
  maxWidth?: string;
  scrollStep?: number;
  showScrollIndicators?: boolean;
  contentClassName?: string;
}

export interface ScrollState {
  canScrollUp: boolean;
  canScrollDown: boolean;
  canScrollLeft: boolean;
  canScrollRight: boolean;
}
