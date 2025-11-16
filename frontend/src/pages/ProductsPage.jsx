import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Star, ShoppingCart, Heart, Search, Filter } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { productsAPI } from '../services/api'

function ProductsPage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchParams, setSearchParams] = useSearchParams()
  const [localSearch, setLocalSearch] = useState(searchParams.get('search') || '')
  
  const { addToCart, isInCart, getItemQuantity } = useCart()
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    loadProducts()
    loadCategories()
  }, [searchParams])

  const loadProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = {}
      if (searchParams.get('category')) params.category = searchParams.get('category')
      if (searchParams.get('search')) params.search = searchParams.get('search')
      if (searchParams.get('min_price')) params.min_price = searchParams.get('min_price')
      if (searchParams.get('max_price')) params.max_price = searchParams.get('max_price')

      const response = await productsAPI.getProducts(params)
      setProducts(response.results || response)
    } catch (err) {
      setError('Failed to load products')
      console.error('Error fetching products:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const response = await productsAPI.getCategories()
      setCategories(response.results || response)
    } catch (err) {
      console.error('Error fetching categories:', err)
    }
  }

  const handleAddToCart = async (e, product) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!isAuthenticated) {
      alert('Please login to add items to cart')
      return
    }

    try {
      const result = await addToCart(product.id, null, 1)
      if (!result.success) {
        alert(result.error || 'Failed to add to cart')
      }
    } catch (error) {
      alert('Failed to add to cart')
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    const newParams = new URLSearchParams(searchParams)
    if (localSearch.trim()) {
      newParams.set('search', localSearch.trim())
    } else {
      newParams.delete('search')
    }
    setSearchParams(newParams)
  }

  const handleFilterChange = (key, value) => {
    const newParams = new URLSearchParams(searchParams)
    if (value) {
      newParams.set(key, value)
    } else {
      newParams.delete(key)
    }
    setSearchParams(newParams)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Products</h1>
        <p className="mt-1 text-sm text-gray-500">
          Discover amazing products from campus stores
        </p>
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-sm text-red-600">{error}</div>
          </div>
        )}
      </div>

      {/* Search and filters */}
      <div className="flex flex-col lg:flex-row gap-6 mb-8">
        {/* Search */}
        <div className="flex-1">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </form>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <select 
            value={searchParams.get('category') || ''}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          
          <select 
            onChange={(e) => {
              const value = e.target.value
              if (value === 'under-1000') {
                handleFilterChange('max_price', '1000')
                handleFilterChange('min_price', '')
              } else if (value === '1000-5000') {
                handleFilterChange('min_price', '1000')
                handleFilterChange('max_price', '5000')
              } else if (value === '5000-20000') {
                handleFilterChange('min_price', '5000')
                handleFilterChange('max_price', '20000')
              } else if (value === 'above-20000') {
                handleFilterChange('min_price', '20000')
                handleFilterChange('max_price', '')
              } else {
                handleFilterChange('min_price', '')
                handleFilterChange('max_price', '')
              }
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Price Range</option>
            <option value="under-1000">Under ₵1,000</option>
            <option value="1000-5000">₵1,000 - ₵5,000</option>
            <option value="5000-20000">₵5,000 - ₵20,000</option>
            <option value="above-20000">Above ₵20,000</option>
          </select>
          
          <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="h-4 w-4 mr-2" />
            More Filters
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="card overflow-hidden group relative">
              {/* Product Link */}
              <Link to={`/products/${product.slug}`} className="block">
                <div className="relative h-48 bg-gray-200 overflow-hidden">
                  {product.main_image || product.images?.[0]?.image ? (
                    <img
                      src={product.main_image || product.images[0].image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200">
                      <span className="text-6xl">📦</span>
                    </div>
                  )}
                  
                  {/* Wishlist button */}
                  <button 
                    onClick={(e) => {e.preventDefault(); e.stopPropagation();}}
                    className="absolute top-2 right-2 p-2 rounded-full bg-white/80 hover:bg-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Heart className="h-4 w-4 text-gray-600 hover:text-red-500" />
                  </button>
                  
                  {/* Stock status */}
                  {product.quantity <= 0 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white font-semibold">Out of Stock</span>
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold mb-2 line-clamp-2">{product.name}</h3>
                  <div className="flex items-center mb-2">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="ml-1 text-sm text-gray-600">
                      {product.rating ? product.rating.toFixed(1) : '0.0'} ({product.review_count || 0})
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-lg font-bold text-primary-600">
                      ₵{parseFloat(product.price).toLocaleString()}
                    </span>
                    {product.compare_at_price && (
                      <span className="text-sm text-gray-400 line-through">
                        ₵{parseFloat(product.compare_at_price).toLocaleString()}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mb-3">{product.store?.name || product.store_name}</p>
                </div>
              </Link>
              
              {/* Add to Cart Button */}
              <div className="p-4 pt-0">
                {isAuthenticated ? (
                  isInCart(product.id) ? (
                    <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                      <span className="text-sm text-green-800 font-medium">
                        In cart ({getItemQuantity(product.id)})
                      </span>
                      <Link 
                        to="/cart"
                        className="text-xs text-green-600 hover:text-green-800 font-medium"
                      >
                        View Cart
                      </Link>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => handleAddToCart(e, product)}
                      disabled={product.quantity <= 0}
                      className="w-full flex items-center justify-center px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      {product.quantity <= 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                  )
                ) : (
                  <Link
                    to="/login"
                    className="w-full flex items-center justify-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Login to Buy
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">No products found.</p>
        </div>
      )}
    </div>
  )
}

export default ProductsPage
