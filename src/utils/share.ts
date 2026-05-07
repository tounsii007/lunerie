export async function shareContent(payload: { title: string; text: string; url: string }): Promise<'shared' | 'copied' | 'unsupported'> {
  if (typeof navigator !== 'undefined' && 'share' in navigator && typeof navigator.share === 'function') {
    await navigator.share(payload);
    return 'shared';
  }

  if (typeof navigator !== 'undefined' && 'clipboard' in navigator && typeof navigator.clipboard.writeText === 'function') {
    await navigator.clipboard.writeText(`${payload.title}\n${payload.text}\n${payload.url}`);
    return 'copied';
  }

  return 'unsupported';
}
