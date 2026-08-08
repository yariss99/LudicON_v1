import {
  forwardRef,
  type HTMLAttributes,
  type TdHTMLAttributes,
  type ThHTMLAttributes,
} from "react";

import { cn } from "../lib/cn";

/**
 * Real tables.
 *
 * The pre-refactor tree contained zero `<table>` elements — every grid of data
 * was divs, which means no row/column association, no header announcement, and
 * nothing for a screen reader to navigate. These primitives exist so tabular
 * data is tabular in the DOM as well as on screen.
 *
 * The wrapper scrolls horizontally rather than shrinking columns, because CH08
 * requires 200% zoom to stay usable and a squeezed table fails first.
 */
export interface TableProps extends HTMLAttributes<HTMLTableElement> {
  /** Class names for the scroll wrapper rather than the table itself. */
  wrapperClassName?: string;
}

export const Table = forwardRef<HTMLTableElement, TableProps>(function Table(
  { className, wrapperClassName, ...props },
  ref,
) {
  return (
    <div className={cn("w-full overflow-x-auto", wrapperClassName)}>
      <table
        ref={ref}
        className={cn(
          "w-full caption-bottom border-collapse text-base",
          className,
        )}
        {...props}
      />
    </div>
  );
});

export type TableSectionProps = HTMLAttributes<HTMLTableSectionElement>;

export const TableHeader = forwardRef<
  HTMLTableSectionElement,
  TableSectionProps
>(function TableHeader({ className, ...props }, ref) {
  return (
    <thead
      ref={ref}
      className={cn("border-b border-border", className)}
      {...props}
    />
  );
});

export const TableBody = forwardRef<HTMLTableSectionElement, TableSectionProps>(
  function TableBody({ className, ...props }, ref) {
    return (
      <tbody
        ref={ref}
        className={cn("[&_tr:last-child]:border-0", className)}
        {...props}
      />
    );
  },
);

export const TableFooter = forwardRef<
  HTMLTableSectionElement,
  TableSectionProps
>(function TableFooter({ className, ...props }, ref) {
  return (
    <tfoot
      ref={ref}
      className={cn("border-t border-border bg-muted font-medium", className)}
      {...props}
    />
  );
});

export type TableRowProps = HTMLAttributes<HTMLTableRowElement>;

export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(
  function TableRow({ className, ...props }, ref) {
    return (
      <tr
        ref={ref}
        className={cn(
          "border-b border-border transition-colors duration-[var(--motion-fast)] ease-standard",
          "hover:bg-muted data-[state=selected]:bg-primary-soft",
          className,
        )}
        {...props}
      />
    );
  },
);

export type TableHeadProps = ThHTMLAttributes<HTMLTableCellElement>;

export const TableHead = forwardRef<HTMLTableCellElement, TableHeadProps>(
  function TableHead({ className, scope = "col", ...props }, ref) {
    return (
      <th
        ref={ref}
        scope={scope}
        className={cn(
          "h-12 px-4 text-left align-middle text-[0.8125rem] font-semibold text-muted-foreground",
          className,
        )}
        {...props}
      />
    );
  },
);

export type TableCellProps = TdHTMLAttributes<HTMLTableCellElement>;

export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(
  function TableCell({ className, ...props }, ref) {
    return (
      <td
        ref={ref}
        className={cn("px-4 py-3 align-middle leading-[1.55]", className)}
        {...props}
      />
    );
  },
);

export type TableCaptionProps = HTMLAttributes<HTMLTableCaptionElement>;

/** Says what the table is. Keep it — it is the table's accessible name. */
export const TableCaption = forwardRef<
  HTMLTableCaptionElement,
  TableCaptionProps
>(function TableCaption({ className, ...props }, ref) {
  return (
    <caption
      ref={ref}
      className={cn(
        "mt-4 text-left text-[0.8125rem] text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
});
