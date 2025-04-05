export function dateFormat(timestamp) {
  if (!timestamp) return 'now';
  if (typeof timestamp === 'string') timestamp = new Date(timestamp);

  const now = new Date();
  const diff = now.getTime() - timestamp.getTime();
  if (diff < 60000) return 'now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} hr ago`;
  
  const days = Math.floor(diff / 86400000);
  return `${days} ${days === 1 ? 'day' : 'days'} ago`;
} 