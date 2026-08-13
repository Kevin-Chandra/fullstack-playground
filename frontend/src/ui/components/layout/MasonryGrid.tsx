"use client"

import { ReactNode } from "react";
import { Masonry } from "react-plock";

export interface MasonryLayoutProps<T> {
  items: T[];
  config: {
    columns: number | number[];
    gap: number | number[];
    media?: number[];
    useBalancedLayout?: boolean;
  };
  render: (item: T, idx: number) => ReactNode;
}

export default function MasonryLayout<T>({
  items,
  config,
  render
}: MasonryLayoutProps<T>) {
  return (
    <Masonry
      items={items}
      config={config}
      render={render}
    />
  );
}