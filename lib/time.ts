export function formatDistanceToNow(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.round((now.getTime() - date.getTime()) / 1000);

  if (seconds < 5) {
    return 'just now';
  }
  if (seconds < 60) {
    return `${seconds} seconds ago`;
  }

  const minutes = Math.round(seconds / 60);
  if (minutes < 60) {
    return minutes === 1 ? 'a minute ago' : `${minutes} minutes ago`;
  }

  const hours = Math.round(minutes / 60);
  if (hours < 24) {
    return hours === 1 ? 'an hour ago' : `${hours} hours ago`;
  }

  const days = Math.round(hours / 24);
  if (days < 7) {
    return days === 1 ? 'a day ago' : `${days} days ago`;
  }
  if (days < 30) {
    const weeks = Math.round(days / 7);
    return weeks === 1 ? 'a week ago' : `${weeks} weeks ago`;
  }

  const months = Math.round(days / 30);
  if (months < 12) {
    return months === 1 ? 'a month ago' : `${months} months ago`;
  }

  const years = Math.round(days / 365);
  return years === 1 ? 'a year ago' : `${years} years ago`;
}
