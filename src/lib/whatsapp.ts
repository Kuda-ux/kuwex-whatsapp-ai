export interface WhatsAppMessagePayload {
  to: string;
  text: string;
  phoneNumberId: string;
  accessToken: string;
}

export async function sendWhatsAppMessage({ to, text, phoneNumberId, accessToken }: WhatsAppMessagePayload): Promise<boolean> {
  const version = process.env.WHATSAPP_API_VERSION || 'v21.0';
  const url = `https://graph.facebook.com/${version}/${phoneNumberId}/messages`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body: text },
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error('WhatsApp send error:', res.status, errBody);
      return false;
    }

    return true;
  } catch (err) {
    console.error('WhatsApp fetch error:', err);
    return false;
  }
}

export function extractMessageData(body: Record<string, unknown>) {
  const entry = (body.entry as Array<Record<string, unknown>>)?.[0];
  const changes = (entry?.changes as Array<Record<string, unknown>>)?.[0];
  const value = changes?.value as Record<string, unknown> | undefined;
  const messages = (value?.messages as Array<Record<string, unknown>>);
  const message = messages?.[0];
  const contacts = (value?.contacts as Array<Record<string, unknown>>);
  const contact = contacts?.[0];
  const metadata = value?.metadata as Record<string, unknown> | undefined;

  if (!message) return null;

  const textObj = message.text as Record<string, unknown> | undefined;
  if (!textObj?.body) return null;

  return {
    phoneNumber: message.from as string,
    messageText: textObj.body as string,
    messageId: message.id as string,
    timestamp: message.timestamp as string,
    displayName: ((contact?.profile as Record<string, unknown>)?.name as string) || 'Customer',
    phoneNumberId: metadata?.phone_number_id as string,
  };
}
