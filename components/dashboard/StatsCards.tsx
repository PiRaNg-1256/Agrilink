interface StatsCardsProps {
  productCount: number
  orderCount: number
  pendingCount: number
}

export default function StatsCards({ productCount, orderCount, pendingCount }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      {[
        { label: 'Active Listings', value: productCount, color: 'text-green-400', bg: 'bg-green-500/10' },
        { label: 'Total Orders', value: orderCount, color: 'text-blue-400', bg: 'bg-blue-500/10' },
        { label: 'Pending Orders', value: pendingCount, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
      ].map(stat => (
        <div key={stat.label} className={`${stat.bg} rounded-2xl p-6 border border-white/10`}>
          <p className="text-gray-400 text-sm">{stat.label}</p>
          <p className={`text-4xl font-black ${stat.color} mt-1`}>{stat.value}</p>
        </div>
      ))}
    </div>
  )
}
