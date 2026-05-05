'use client';

import { Suspense, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, Package } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
}

function CheckoutSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const orderId = searchParams.get('orderId');
  const reference = searchParams.get('reference') ?? searchParams.get('trxref');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  const { data: order } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => api.get<{ data: Order }>(`/orders/${orderId}`).then((r) => r.data),
    enabled: !!orderId && isAuthenticated,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === 'PENDING' || !status ? 3000 : false;
    },
  });

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-hunter-green/10">
        <CheckCircle className="h-10 w-10 text-hunter-green" />
      </div>

      <h1 className="mt-6 text-3xl font-bold text-text-primary">Order Placed!</h1>

      {order ? (
        <>
          <p className="mt-2 text-text-secondary">
            Order <span className="font-semibold text-text-primary">{order.orderNumber}</span> is confirmed.
          </p>
          <p className="mt-1 text-sm text-medium-gray capitalize">
            Status: {order.status.toLowerCase().replace('_', ' ')}
          </p>
        </>
      ) : reference ? (
        <p className="mt-2 text-text-secondary">
          Payment reference: <span className="font-mono text-sm">{reference}</span>
        </p>
      ) : (
        <p className="mt-2 text-text-secondary">
          Your order has been received and is being processed.
        </p>
      )}

      <p className="mt-4 max-w-sm text-sm text-medium-gray">
        You will receive an email confirmation shortly. Track your order in your account.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        {order && (
          <Link
            href={`/orders/${order.id}`}
            className="flex items-center gap-2 rounded-xl bg-hunter-green px-6 py-3 text-sm font-semibold text-white hover:bg-hunter-green/90"
          >
            <Package className="h-4 w-4" />
            Track Order
          </Link>
        )}
        <Link
          href="/shop"
          className="rounded-xl border border-light-gray px-6 py-3 text-sm font-semibold text-charcoal hover:border-charcoal"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
