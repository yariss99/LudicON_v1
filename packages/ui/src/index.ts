/**
 * `@ludicon/ui` — the whole design system, in one import.
 *
 * Everything here resolves its colour through the semantic token layer in
 * `styles/tokens.css`. There is not a single hex, palette class or literal
 * colour in any component: that indirection is what makes light, dark and
 * high-contrast one code path instead of three, and it is what the 1,920
 * hardcoded palette classes in the pre-refactor tree cost us.
 *
 * Consumers must import the stylesheet once:
 *   import "@ludicon/ui/styles.css";
 */

/* ---- Utilities ---- */
export { cn } from "./lib/cn";

/* ---- Theme ---- */
export {
  ThemeProvider,
  useTheme,
  THEME_INIT_SCRIPT,
} from "./theme/theme-provider";
export type { ThemePreference, ResolvedTheme } from "./theme/theme-provider";

/* ---- Actions ---- */
export { Button, buttonVariants } from "./components/button";
export type { ButtonProps } from "./components/button";

/* ---- Containers ---- */
export {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./components/card";
export type {
  CardContentProps,
  CardDescriptionProps,
  CardFooterProps,
  CardHeaderProps,
  CardProps,
  CardTitleProps,
} from "./components/card";

/* ---- Form controls ---- */
export { Input } from "./components/input";
export type { InputProps } from "./components/input";

export { Textarea } from "./components/textarea";
export type { TextareaProps } from "./components/textarea";

export { Label } from "./components/label";
export type { LabelProps } from "./components/label";

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "./components/select";
export type {
  SelectContentProps,
  SelectItemProps,
  SelectLabelProps,
  SelectSeparatorProps,
  SelectTriggerProps,
} from "./components/select";

export { Checkbox } from "./components/checkbox";
export type { CheckboxProps } from "./components/checkbox";

export { RadioGroup, RadioGroupItem } from "./components/radio-group";
export type {
  RadioGroupItemProps,
  RadioGroupProps,
} from "./components/radio-group";

export { Switch } from "./components/switch";
export type { SwitchProps } from "./components/switch";

export { Slider } from "./components/slider";
export type { SliderProps } from "./components/slider";

export { ToggleGroup, ToggleGroupItem } from "./components/toggle-group";
export type {
  ToggleGroupItemProps,
  ToggleGroupProps,
} from "./components/toggle-group";

/* ---- Status and feedback ---- */
export { Badge, badgeVariants } from "./components/badge";
export type { BadgeProps } from "./components/badge";

export { Progress } from "./components/progress";
export type { ProgressProps } from "./components/progress";

export { LoadingBlock, Skeleton, SkeletonText } from "./components/skeleton";
export type {
  LoadingBlockProps,
  SkeletonProps,
  SkeletonTextProps,
} from "./components/skeleton";

export { Toaster, toast } from "./components/toast";
export type { ToasterProps } from "./components/toast";

/* ---- Structure ---- */
export { Separator } from "./components/separator";
export type { SeparatorProps } from "./components/separator";

export { Avatar } from "./components/avatar";
export type { AvatarProps, AvatarSize } from "./components/avatar";

export {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./components/accordion";
export type {
  AccordionContentProps,
  AccordionItemProps,
  AccordionTriggerProps,
} from "./components/accordion";

export {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./components/collapsible";
export type {
  CollapsibleContentProps,
  CollapsibleTriggerProps,
} from "./components/collapsible";

export { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/tabs";
export type {
  TabsContentProps,
  TabsListProps,
  TabsTriggerProps,
} from "./components/tabs";

export { ScrollArea, ScrollBar } from "./components/scroll-area";
export type { ScrollAreaProps, ScrollBarProps } from "./components/scroll-area";

export {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "./components/resizable";
export type {
  ResizableHandleProps,
  ResizablePanelGroupProps,
  ResizablePanelProps,
} from "./components/resizable";

export {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "./components/table";
export type {
  TableCaptionProps,
  TableCellProps,
  TableHeadProps,
  TableProps,
  TableRowProps,
  TableSectionProps,
} from "./components/table";

/* ---- Overlays ---- */
export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "./components/dialog";
export type {
  DialogContentProps,
  DialogDescriptionProps,
  DialogFooterProps,
  DialogHeaderProps,
  DialogOverlayProps,
  DialogTitleProps,
} from "./components/dialog";

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./components/alert-dialog";
export type {
  AlertDialogActionProps,
  AlertDialogCancelProps,
  AlertDialogContentProps,
  AlertDialogDescriptionProps,
  AlertDialogFooterProps,
  AlertDialogHeaderProps,
  AlertDialogTitleProps,
} from "./components/alert-dialog";

export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./components/sheet";
export type {
  SheetContentProps,
  SheetDescriptionProps,
  SheetFooterProps,
  SheetHeaderProps,
  SheetTitleProps,
} from "./components/sheet";

export {
  Popover,
  PopoverAnchor,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from "./components/popover";
export type { PopoverContentProps } from "./components/popover";

export {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./components/tooltip";
export type { TooltipContentProps } from "./components/tooltip";

export {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./components/dropdown-menu";
export type {
  DropdownMenuCheckboxItemProps,
  DropdownMenuContentProps,
  DropdownMenuItemProps,
  DropdownMenuLabelProps,
  DropdownMenuRadioItemProps,
  DropdownMenuSeparatorProps,
  DropdownMenuShortcutProps,
  DropdownMenuSubContentProps,
  DropdownMenuSubTriggerProps,
} from "./components/dropdown-menu";

export {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "./components/context-menu";
export type {
  ContextMenuContentProps,
  ContextMenuProps,
  ContextMenuTriggerProps,
} from "./components/context-menu";

/* ---- Command palette ---- */
export {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "./components/command";
export type {
  CommandDialogProps,
  CommandEmptyProps,
  CommandGroupProps,
  CommandInputProps,
  CommandItemProps,
  CommandListProps,
  CommandProps,
  CommandSeparatorProps,
  CommandShortcutProps,
} from "./components/command";

/* ---- PRIMA ---- */
export { PrimaMark } from "./components/prima/prima-mark";
export type {
  PrimaMarkProps,
  PrimaMarkSize,
} from "./components/prima/prima-mark";

export { EmptyState } from "./components/prima/empty-state";
export type { EmptyStateProps } from "./components/prima/empty-state";

export {
  LIFECYCLE_STATUS_LABELS,
  StatusBadge,
} from "./components/prima/status-badge";
export type {
  LifecycleStatus,
  StatusBadgeProps,
} from "./components/prima/status-badge";

export { SectionHeader } from "./components/prima/section-header";
export type { SectionHeaderProps } from "./components/prima/section-header";

export { FloatingSuggestion } from "./components/prima/floating-suggestion";
export type { FloatingSuggestionProps } from "./components/prima/floating-suggestion";

export { DesignScoreMeter } from "./components/prima/design-score-meter";
export type {
  DesignScoreDimension,
  DesignScoreMeterProps,
} from "./components/prima/design-score-meter";

export { ThemeToggle } from "./components/prima/theme-toggle";
export type { ThemeToggleProps } from "./components/prima/theme-toggle";
