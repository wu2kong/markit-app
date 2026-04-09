export function parseUrlInput(input: string): { url: string; title: string } | null {
  const trimmed = input.trim();

  const mdLinkRegex = /^\[([^\]]+)\]\(([^)]+)\)$/;
  const mdMatch = trimmed.match(mdLinkRegex);
  if (mdMatch) return { title: mdMatch[1], url: mdMatch[2] };

  const lines = trimmed.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length === 2) {
    const maybeUrl = lines.find(l => l.startsWith('http://') || l.startsWith('https://'));
    const maybeTitle = lines.find(l => !l.startsWith('http://') && !l.startsWith('https://'));
    if (maybeUrl && maybeTitle) return { url: maybeUrl, title: maybeTitle };
  }

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      new URL(trimmed);
      return { url: trimmed, title: '' };
    } catch {
      return null;
    }
  }

  return null;
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

export async function openUrl(url: string): Promise<void> {
  try {
    const { open } = await import('@tauri-apps/plugin-shell');
    await open(url);
  } catch {
    window.open(url, '_blank');
  }
}

export function formatMarkdownLink(title: string, url: string): string {
  return `[${title}](${url})`;
}

export function getDomainFromUrl(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'Z');
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

export async function confirmDialog(message: string): Promise<boolean> {
  try {
    const { ask } = await import('@tauri-apps/plugin-dialog');
    return await ask(message, { kind: 'warning' });
  } catch {
    return window.confirm(message);
  }
}