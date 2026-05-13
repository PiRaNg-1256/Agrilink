'use client'
import { useEffect, useState } from 'react'
import { getReviews, submitReview, getUserReview, type Review } from '@/lib/actions/reviews'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Star } from 'lucide-react'
import { Button } from '@/components/ui/button'

function StarRating({ rating, size = 4 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} className={`w-${size} h-${size} ${s <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'}`} />
      ))}
    </div>
  )
}

function ClickableStars({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(s => (
        <button key={s} type="button"
          onMouseEnter={() => setHover(s)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(s)}>
          <Star className={`w-6 h-6 transition-colors ${s <= (hover || value) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'}`} />
        </button>
      ))}
    </div>
  )
}

export default function ReviewsSection({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [userRole, setUserRole] = useState<string | null>(null)
  const [existingReview, setExistingReview] = useState<Review | null>(null)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    getReviews(productId).then(setReviews)
    getUserReview(productId).then(setExistingReview)
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single()
        setUserRole(data?.role ?? null)
      }
    })
  }, [productId])

  const avg = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null

  const handleSubmit = async () => {
    if (rating === 0) { toast.error('Select a rating'); return }
    setSubmitting(true)
    try {
      await submitReview(productId, rating, comment)
      toast.success('Review submitted!')
      const updated = await getReviews(productId)
      setReviews(updated)
      setExistingReview({ id: '', product_id: productId, consumer_id: '', rating, comment, created_at: new Date().toISOString() })
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mt-16 border-t border-white/10 pt-12">
      <div className="flex items-center gap-4 mb-8">
        <h2 className="text-2xl font-black text-white">Reviews</h2>
        {avg && (
          <div className="flex items-center gap-2">
            <StarRating rating={Math.round(Number(avg))} size={5} />
            <span className="text-yellow-400 font-bold">{avg}</span>
            <span className="text-gray-500 text-sm">({reviews.length})</span>
          </div>
        )}
      </div>

      {userRole === 'consumer' && !existingReview && !productId.startsWith('fake-') && (
        <div className="p-6 rounded-2xl border border-white/10 bg-white/5 mb-8">
          <h3 className="text-white font-bold mb-4">Write a Review</h3>
          <ClickableStars value={rating} onChange={setRating} />
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Share your experience..."
            rows={3}
            className="mt-4 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-green-400/50 resize-none"
          />
          <Button onClick={handleSubmit} disabled={submitting}
            className="mt-3 bg-green-500 hover:bg-green-400 text-black font-bold">
            {submitting ? 'Submitting...' : 'Submit Review'}
          </Button>
        </div>
      )}

      <div className="space-y-4">
        {reviews.map(r => (
          <div key={r.id} className="p-5 rounded-2xl border border-white/10 bg-white/5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 font-bold text-sm">
                  {r.profiles?.full_name?.[0] ?? 'U'}
                </div>
                <span className="text-white font-medium text-sm">{r.profiles?.full_name ?? 'Anonymous'}</span>
              </div>
              <div className="flex items-center gap-2">
                <StarRating rating={r.rating} size={3} />
                <span className="text-gray-600 text-xs">{new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
              </div>
            </div>
            {r.comment && <p className="text-gray-400 text-sm">{r.comment}</p>}
          </div>
        ))}
        {reviews.length === 0 && <p className="text-gray-500 text-sm">No reviews yet.</p>}
      </div>
    </div>
  )
}
