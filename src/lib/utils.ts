import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function randomizedReturnDelay<T>(
  min: number,
  max: number,
  processTime: number,
  returnValue: T
): Promise<T> {
  const randomDelay = Math.floor(Math.random() * (max - min + 1) + min);
  const remainingDelay = Math.max(0, randomDelay - processTime);

  await new Promise((resolve) => setTimeout(resolve, remainingDelay));

  return returnValue;
}

export const googleErrorMessages: Record<
  string,
  { message: string; status: number }
> = {
  invalid_request: {
    message:
      "Oops! Something went wrong with your request. Please check your input and try again.",
    status: 400,
  },
  access_denied: {
    message:
      "You’ve declined access to the application. If this was a mistake, you can try again.",
    status: 403,
  },
  server_error: {
    message: "There was an issue on our end. Please try again later.",
    status: 500,
  },
  temporarily_unavailable: {
    message: "The service is currently unavailable. Please try again shortly.",
    status: 503,
  },
};

export const gitHubErrorMessages: Record<
  string,
  { message: string; status: number }
> = {
  access_denied: {
    message:
      "You’ve declined access to the application. If this was a mistake, you can try again.",
    status: 403,
  },
};
