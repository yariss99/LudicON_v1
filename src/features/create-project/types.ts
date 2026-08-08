export type QuickProjectInput = {
  title: string;
  subject: string;
  grade: string;
  schoolYear: string;
};

export type QuickProjectErrors = Partial<
  Record<keyof QuickProjectInput, string>
>;
