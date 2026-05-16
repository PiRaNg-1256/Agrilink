import dynamic from 'next/dynamic'

const DynamicMap = dynamic(() => import('./BaseMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full bg-gray-800 rounded-xl animate-pulse flex items-center justify-center text-gray-500 text-sm"
         style={{ height: '500px' }}>
      Loading map...
    </div>
  ),
})

export default DynamicMap
