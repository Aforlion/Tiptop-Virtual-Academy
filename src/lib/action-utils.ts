export type ActionResult<T = unknown> = 
  | { success: true; message?: string; data?: T } 
  | { success: false; error: string };
