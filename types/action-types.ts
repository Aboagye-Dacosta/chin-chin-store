export interface ActionState<T> {
  error?: Record<string, string[]>;
  success?: boolean;
  data?: T;
}
