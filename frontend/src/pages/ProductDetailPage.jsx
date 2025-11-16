import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Star, ShoppingCart, Heart } from 'lucide-react'
import { productsAPI } from '../services/api'

function ProductDetailPage() {
  const { slug } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProduct = async () => {
      try {
        console.log('Loading product with slug:', slug);
        const productData = await productsAPI.getProduct(slug);
        console.log('Product data received:', productData);
        setProduct(productData);
      } catch (error) {
        console.error('Error fetching product:', error);
        console.error('Error details:', error.response?.data);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [slug])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-200 h-96 rounded-lg"></div>
            <div>
              <div className="h-8 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <p className="text-gray-600">The product you're looking for doesn't exist.</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Images */}
        <div>
          <div className="bg-gray-200 rounded-lg overflow-hidden mb-4">
            {product.images && product.images.length > 0 ? (
              <img
                src={product.images[0].image}
                alt={product.name}
                className="w-full h-96 object-cover"
              />
            ) : (
              <div className="w-full h-96 flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200">
                <span className="text-9xl">📦</span>
              </div>
            )}
          </div>
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.slice(1, 5).map((img, idx) => (
                <img
                  key={idx}
                  src={img.image}
                  alt={`${product.name} ${idx + 2}`}
                  className="w-full h-20 object-cover rounded cursor-pointer hover:opacity-75"
                />
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          
          <div className="flex items-center mb-4">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${
                    i < Math.floor(product.rating || 0)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="ml-2 text-gray-600">
              {product.rating ? product.rating.toFixed(1) : '0.0'} ({product.review_count || 0} reviews)
            </span>
          </div>

          <div className="mb-6">
            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-3xl font-bold text-primary-600">
                ₵{parseFloat(product.price).toLocaleString()}
              </span>
              {product.compare_at_price && (
                <span className="text-xl text-gray-400 line-through">
                  ₵{parseFloat(product.compare_at_price).toLocaleString()}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600">
              Sold by: <span className="font-semibold">{product.store_name}</span>
            </p>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-gray-600">{product.description}</p>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold mb-2">Product Details</h3>
            <dl className="grid grid-cols-2 gap-2 text-sm">
              <dt className="text-gray-600">Condition:</dt>
              <dd className="font-semibold capitalize">{product.condition?.replace('_', ' ')}</dd>
              <dt className="text-gray-600">Stock:</dt>
              <dd className="font-semibold">
                {product.quantity > 0 ? `${product.quantity} available` : 'Out of stock'}
              </dd>
              {product.category_name && (
                <>
                  <dt className="text-gray-600">Category:</dt>
                  <dd className="font-semibold">{product.category_name}</dd>
                </>
              )}
            </dl>
          </div>

          <div className="flex gap-4">
            <button
              className="btn-primary flex-1 flex items-center justify-center"
              disabled={product.quantity === 0}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              {product.quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
            </button>
            <button className="btn-secondary">
              <Heart className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      {product.reviews && product.reviews.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
          <div className="space-y-4">
            {product.reviews.map((review) => (
              <div key={review.id} className="card p-6">
                <div className="flex items-center mb-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="ml-2 font-semibold">{review.user_name}</span>
                  <span className="ml-auto text-sm text-gray-500">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>
                <h4 className="font-semibold mb-2">{review.title}</h4>
                <p className="text-gray-600">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductDetailPage
