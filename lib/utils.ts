import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// FORMAT DATE USING LOCAL TIMEZONE COMPONENTS (DISPLAYS USER'S LOCAL DAY)
export function formatEntryDate(dateString: string, formatStr: string): string {
  const d = new Date(dateString);
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  if (formatStr === 'MMMM d, yyyy') {
    return `${monthNames[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  } else if (formatStr === 'EEEE') {
    return dayNames[d.getDay()];
  } else if (formatStr === 'MMM d, yyyy') {
    const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${shortMonths[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  } else if (formatStr === 'yyyy-MM-dd') {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  // FALLBACK TO STANDARD FORMAT
  return new Date(dateString).toLocaleDateString();
} 