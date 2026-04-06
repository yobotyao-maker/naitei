import StripeOrders from '@/components/admin/StripeOrders'

export default function OrdersPage() {
  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="text-lg font-semibold text-gray-900">注文明細</h1>
      <StripeOrders />
    </div>
  )
}
