import { useState, useEffect } from 'react'
import { Store, Star } from 'lucide-react'
import { storesAPI } from '../services/api'

function StoresPage() {
  const [stores, setStores] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStores = async () => {
      try {
        const data = await storesAPI.getStores()
        setStores(data.results || data)
      } catch (error) {
        console.error('Error fetching stores:', error)
      } finally {
        setLoading(false)
      }
    }
    loadStores()
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">All Stores</h1>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="bg-gray-200 h-20 w-20 rounded-full mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto"></div>
            </div>
          ))}
        </div>
      ) : stores.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {stores.map((store) => (
            <div key={store.id} className="card p-6 text-center hover:shadow-xl transition-all">
              <div className="mb-4">
                {store.logo ? (
                  <img
                    src={store.logo}
                    alt={store.name}
                    className="w-20 h-20 rounded-full mx-auto object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full mx-auto bg-primary-100 flex items-center justify-center">
                    <Store className="h-10 w-10 text-primary-600" />
                  </div>
                )}
              </div>
              <h3 className="font-bold text-lg mb-2">{store.name}</h3>
              {store.rating > 0 && (
                <div className="flex items-center justify-center mb-2">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="ml-1 text-sm text-gray-600">
                    {store.rating.toFixed(1)} ({store.total_ratings})
                  </span>
                </div>
              )}
              <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                {store.description || 'No description available'}
              </p>
              <button className="btn-primary w-full text-sm py-2">
                View Store
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">No stores found.</p>
        </div>
      )}
    </div>
  )
}

export default StoresPage
