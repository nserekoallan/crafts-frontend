'use client';

import { MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WhatsAppButtonProps {
  productName: string;
  className?: string;
}

const WHATSAPP_NUMBER = '256700000000';

/**
 * "Order via WhatsApp" button that opens WhatsApp with a pre-filled message.
 */
export function WhatsAppButton({ productName, className }: WhatsAppButtonProps) {
  const message = encodeURIComponent(
    `Hi! I'm interested in ordering "${productName}" from Crafts Continent. Could you help me with the details?`,
  );

  return (
    <a
      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#25D366] px-6 font-semibold text-white transition-colors hover:bg-[#1ebe57]',
        className,
      )}
    >
      <MessageCircle className="h-5 w-5" />
      Order via WhatsApp
    </a>
  );
}
