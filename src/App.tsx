import { createContext, useContext, useEffect, useMemo, useState, type FormEvent } from 'react'
import { BrowserRouter, Link, NavLink, Route, Routes, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import './App.css'

type Product = {
  id: number
  name: string
  category: string
  price: number
  originalPrice: number
  rating: number
  reviews: string
  image: string
  label?: string
  tone: string
  description: string
  fabric: string
}
type CartEntry = { product: Product; quantity: number; size: string }
type StoreContextValue = {
  cart: CartEntry[]
  wishlist: number[]
  addToCart: (product: Product, size: string, quantity?: number) => void
  changeQuantity: (productId: number, size: string, amount: number) => void
  toggleWishlist: (productId: number) => void
  notice: string
}

const products: Product[] = [
  { id: 1, name: 'Printed cotton kurta set', category: 'Kurta sets', price: 699, originalPrice: 1399, rating: 4.8, reviews: '2.4k', image: 'photo-1539109136881-3be0616acf4b', label: 'Bestseller', tone: 'sand', description: 'A breezy cotton set with an easy, flattering silhouette and a little print that makes every day feel special.', fabric: '100% breathable cotton · Gentle machine wash' },
  { id: 2, name: 'Everyday relaxed-fit tee', category: 'Everyday wear', price: 299, originalPrice: 599, rating: 4.6, reviews: '1.8k', image: 'photo-1521572163474-6864f9cf17ab', label: 'Just in', tone: 'blue', description: 'Your softest tee, cut with room to move. Wear it tucked, loose, or borrowed from your own weekend plans.', fabric: 'Combed cotton blend · Gentle machine wash' },
  { id: 3, name: 'Soft drape co-ord set', category: 'Co-ord sets', price: 849, originalPrice: 1699, rating: 4.9, reviews: '986', image: 'photo-1594633312681-425c7b97ccd1', label: 'Customer favourite', tone: 'rose', description: 'A matching set that does all the thinking for you. Soft, fluid fabric meets a relaxed, put-together fit.', fabric: 'Viscose blend · Hand wash cold' },
  { id: 4, name: 'Classic linen blend shirt', category: 'Shirts', price: 549, originalPrice: 1099, rating: 4.7, reviews: '1.2k', image: 'photo-1598033129183-c4f50c736f10', label: 'Bestseller', tone: 'cream', description: 'A timeless button-down with the lived-in texture of linen and the easy comfort you will reach for again.', fabric: 'Linen-cotton blend · Gentle machine wash' },
  { id: 5, name: 'Floral festive kurta', category: 'Kurta sets', price: 599, originalPrice: 1199, rating: 4.5, reviews: '756', image: 'photo-1539109136881-3be0616acf4b', label: 'Trending', tone: 'green', description: 'A joyful floral print and a relaxed shape make this the one you will wear well beyond the occasion.', fabric: 'Soft cotton blend · Gentle machine wash' },
  { id: 6, name: 'Weekend denim jacket', category: 'Everyday wear', price: 999, originalPrice: 1999, rating: 4.8, reviews: '643', image: 'photo-1543076447-215ad9ba6923', label: 'New season', tone: 'denim', description: 'A classic layer with a soft hand-feel and just enough structure. Made for cool evenings and repeat wears.', fabric: 'Cotton denim · Wash inside out' },
  { id: 7, name: 'Easy-breezy printed dress', category: 'Dresses', price: 749, originalPrice: 1499, rating: 4.7, reviews: '1.1k', image: 'photo-1496747611176-843222e1e57c', label: 'Just in', tone: 'lilac', description: 'An easy throw-on dress with a softly defined waist and a print that feels like a long weekend.', fabric: 'Rayon blend · Hand wash cold' },
  { id: 8, name: 'Premium cotton shirt', category: 'Shirts', price: 499, originalPrice: 999, rating: 4.6, reviews: '892', image: 'photo-1603252109303-2751441dd157', description: 'The everyday button-down, made softer. A polished shape that still feels like your favourite shirt.', fabric: '100% cotton · Gentle machine wash', tone: 'mint' },
]
const categories = ['All styles', 'Kurta sets', 'Everyday wear', 'Co-ord sets', 'Shirts', 'Dresses']
const imageUrl = (id: string, width = 800) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`
const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`
const readStored = <T,>(key: string, fallback: T): T => {
  try { const value = localStorage.getItem(key); return value ? JSON.parse(value) as T : fallback } catch { return fallback }
}

function Icon({ name, size = 20 }: { name: 'search' | 'heart' | 'bag' | 'menu' | 'close' | 'minus' | 'plus' | 'arrow' | 'user' | 'truck' | 'shield' | 'return'; size?: number }) {
  const paths = {
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />,
    bag: <><path d="M5 8h14l1 13H4L5 8Z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></>,
    menu: <><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" /></>,
    close: <><path d="m6 6 12 12" /><path d="M18 6 6 18" /></>,
    minus: <path d="M5 12h14" />,
    plus: <><path d="M12 5v14" /><path d="M5 12h14" /></>,
    arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M5 21a7 7 0 0 1 14 0" /></>,
    truck: <><path d="M3 6h11v12H3z" /><path d="M14 10h4l3 3v5h-7z" /><circle cx="7.5" cy="19" r="1.5" /><circle cx="17.5" cy="19" r="1.5" /></>,
    shield: <><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" /><path d="m9 12 2 2 4-4" /></>,
    return: <><path d="M3 12a9 9 0 1 0 2.6-6.4L3 8" /><path d="M3 3v5h5" /><path d="M12 7v5l3 2" /></>,
  }
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>
}

function App() {
  const [cart, setCart] = useState<CartEntry[]>(() => readStored('aaron-cart', []))
  const [wishlist, setWishlist] = useState<number[]>(() => readStored('aaron-wishlist', []))
  const [notice, setNotice] = useState('')
  const itemCount = cart.reduce((total, entry) => total + entry.quantity, 0)
  const notify = (message: string) => { setNotice(message); window.setTimeout(() => setNotice(''), 2800) }
  const store: StoreContextValue = {
    cart, wishlist, notice,
    addToCart: (product, size, quantity = 1) => {
      setCart((current) => {
        const existing = current.find((entry) => entry.product.id === product.id && entry.size === size)
        return existing
          ? current.map((entry) => entry.product.id === product.id && entry.size === size ? { ...entry, quantity: entry.quantity + quantity } : entry)
          : [...current, { product, size, quantity }]
      })
      notify(`${product.name} · ${size} added to your bag`)
    },
    changeQuantity: (productId, size, amount) => setCart((current) => current.map((entry) => entry.product.id === productId && entry.size === size ? { ...entry, quantity: entry.quantity + amount } : entry).filter((entry) => entry.quantity > 0)),
    toggleWishlist: (productId) => setWishlist((current) => current.includes(productId) ? current.filter((id) => id !== productId) : [...current, productId]),
  }
  useEffect(() => { localStorage.setItem('aaron-cart', JSON.stringify(cart)) }, [cart])
  useEffect(() => { localStorage.setItem('aaron-wishlist', JSON.stringify(wishlist)) }, [wishlist])
  return <BrowserRouter><StoreContext.Provider value={store}><Storefront itemCount={itemCount} clearCart={() => setCart([])} notify={notify} /></StoreContext.Provider></BrowserRouter>
}

const StoreContext = createContext<StoreContextValue | null>(null)
function useStore() {
  const value = useContext(StoreContext)
  if (!value) throw new Error('Store context is missing')
  return value
}

function Storefront({ itemCount, clearCart, notify }: { itemCount: number; clearCart: () => void; notify: (message: string) => void }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [search, setSearch] = useState('')
  const { notice } = useStore()
  const navigate = useNavigate()
  const submitSearch = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); navigate(`/shop?q=${encodeURIComponent(search)}`); setSearchOpen(false); setMobileMenuOpen(false) }
  return <>
    <div className="announcement"><span>✳</span><span>Good things, delivered. Free shipping on orders over ₹999.</span><Link to="/shop">Shop the edit <Icon name="arrow" size={14} /></Link></div>
    <header className="site-header">
      <button className="icon-button mobile-menu-button" aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'} onClick={() => setMobileMenuOpen((open) => !open)}><Icon name={mobileMenuOpen ? 'close' : 'menu'} /></button>
      <Link className="wordmark" to="/" aria-label="Aaron Garments home"><span className="wordmark-mark">A</span><span>AARON <b>GARMENTS</b><small>MADE FOR YOUR EVERYDAY</small></span></Link>
      <nav className={`main-nav ${mobileMenuOpen ? 'is-open' : ''}`} aria-label="Main navigation">
        <NavLink to="/shop">New arrivals</NavLink><NavLink to="/shop?category=Kurta%20sets">Kurta sets</NavLink><NavLink to="/shop?category=Everyday%20wear">Everyday wear</NavLink><NavLink to="/shop?category=Co-ord%20sets">Co-ord sets</NavLink><NavLink to="/about">Our story</NavLink>
      </nav>
      <div className="header-actions">
        <form className={`search-box ${searchOpen ? 'search-open' : ''}`} onSubmit={submitSearch}><button type="button" aria-label="Search" onClick={() => { setSearchOpen(true); document.getElementById('site-search')?.focus() }}><Icon name="search" size={19} /></button><input id="site-search" aria-label="Search styles" placeholder="Search styles..." value={search} onChange={(event) => setSearch(event.target.value)} />{search && <button type="button" aria-label="Clear search" onClick={() => setSearch('')}><Icon name="close" size={15} /></button>}</form>
        <Link className="icon-button wishlist-header" aria-label="Wishlist" to="/wishlist"><Icon name="heart" /></Link>
        <Link className="icon-button bag-button" aria-label={`Shopping bag, ${itemCount} items`} to="/cart"><Icon name="bag" />{itemCount > 0 && <span className="bag-count">{itemCount}</span>}</Link>
      </div>
    </header>
    <main><Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/shop" element={<ShopPage />} />
      <Route path="/product/:productId" element={<ProductPage />} />
      <Route path="/wishlist" element={<WishlistPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/checkout" element={<CheckoutPage clearCart={clearCart} notify={notify} />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/help" element={<HelpPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes></main>
    <SiteFooter />
    {notice && <div className="toast" role="status">{notice}<span>✓</span></div>}
  </>
}

function HomePage() {
  const featured = [products[0], products[2], products[3], products[6]]
  return <>
    <section className="hero-section"><div className="hero-copy"><span className="eyebrow"><span className="eyebrow-line" /> THE NEW SEASON EDIT</span><h1>Good clothes.<br /><em>Good days.</em></h1><p>Easy pieces, thoughtful details, and feel-good prices. Meet your new everyday favourites.</p><Link className="button button-dark" to="/shop">Shop the collection <Icon name="arrow" size={17} /></Link><div className="hero-note"><span className="note-stars">★★★★★</span> Easy style, made for real life</div></div><div className="hero-visual" role="img" aria-label="The new season Aaron Garments collection"><div className="hero-photo hero-photo-main" /><div className="hero-photo hero-photo-detail" /><div className="hero-sticker"><span>STYLE<br />THAT FEELS<br /><b>LIKE YOU</b></span><i>✳</i></div><div className="hero-caption"><span>THE SUNDAY MORNING EDIT</span><span>01 / 04</span></div></div></section>
    <TrustStrip />
    <section className="home-categories"><div className="section-heading"><div><span className="eyebrow">A LITTLE SOMETHING FOR EVERY DAY</span><h2>Shop by mood</h2><p>Start with what you feel like wearing.</p></div><Link className="text-link" to="/shop">View everything <Icon name="arrow" size={15} /></Link></div><div className="category-cards">{categories.slice(1, 5).map((category, index) => <Link className={`category-card category-card-${index + 1}`} to={`/shop?category=${encodeURIComponent(category)}`} key={category}><span className="category-card-image" style={{ backgroundImage: `url(${imageUrl(products[index].image, 600)})` }} /><span className="category-card-copy"><small>THE AARON EDIT</small><b>{category}</b><span>Explore styles <Icon name="arrow" size={14} /></span></span></Link>)}</div></section>
    <ProductShelf title="The ones you keep reaching for" label="AARON FAVOURITES" items={featured} />
    <section className="editorial-banner"><div className="editorial-photo" /><div className="editorial-copy"><span className="eyebrow">A LITTLE MORE YOU</span><h2>Wear what feels<br /><em>like you.</em></h2><p>We believe getting dressed should feel easy. Thoughtful everyday pieces, at prices that leave room for the rest of life.</p><Link className="button button-outline" to="/about">A little about us <Icon name="arrow" size={16} /></Link></div></section>
    <section className="newsletter"><div className="newsletter-flower">✳</div><div><span className="eyebrow">A NOTE FROM AARON</span><h2>A little joy in your inbox.</h2><p>New drops, outfit ideas, and a first look at the good stuff.</p></div><form onSubmit={(event) => { event.preventDefault(); window.alert('Thanks for joining the Aaron Garments list!') }}><label className="sr-only" htmlFor="newsletter-email">Email address</label><input id="newsletter-email" type="email" placeholder="Your email address" required /><button type="submit" aria-label="Subscribe"><Icon name="arrow" /></button></form></section>
  </>
}

function TrustStrip() {
  return <section className="promise-strip" aria-label="Shopping benefits"><div><span className="promise-icon"><Icon name="truck" size={18} /></span><span><b>Free shipping over ₹999</b><small>Across India</small></span></div><div><span className="promise-icon"><Icon name="return" size={18} /></span><span><b>Easy 7-day returns</b><small>Changed your mind? No worries.</small></span></div><div><span className="promise-icon"><Icon name="shield" size={18} /></span><span><b>Secure checkout</b><small>Your details stay protected</small></span></div></section>
}

function ProductShelf({ title, label, items }: { title: string; label: string; items: Product[] }) {
  return <section className="shop-section shelf-section"><div className="section-heading"><div><span className="eyebrow">{label}</span><h2>{title}</h2><p>Good pieces, good prices, and a little everyday magic.</p></div><Link className="text-link" to="/shop">Shop all <Icon name="arrow" size={15} /></Link></div><ProductGrid items={items} /></section>
}

function ProductGrid({ items }: { items: Product[] }) {
  const { wishlist, toggleWishlist } = useStore()
  const navigate = useNavigate()
  return <div className="product-grid">{items.map((product) => {
    const saved = wishlist.includes(product.id)
    const discount = Math.round((1 - product.price / product.originalPrice) * 100)
    return <article className="product-card" key={product.id}>
      <div className={`product-image ${product.tone}`}><Link to={`/product/${product.id}`} aria-label={`View ${product.name}`}><img src={imageUrl(product.image)} alt={product.name} loading="lazy" /></Link><span className="product-label">{product.label ?? `${discount}% OFF`}</span><button className={`save-button ${saved ? 'is-saved' : ''}`} aria-label={saved ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`} onClick={() => toggleWishlist(product.id)}><Icon name="heart" size={18} /></button><button className="quick-add" onClick={() => navigate(`/product/${product.id}`)}>Choose a size <span>+</span></button></div>
      <div className="product-info"><div className="product-title-row"><Link to={`/product/${product.id}`}><h3>{product.name}</h3></Link><span className="rating">★ {product.rating}</span></div><p className="product-category">{product.category} <span>· {product.reviews} reviews</span></p><div className="price-row"><strong>{formatPrice(product.price)}</strong><del>{formatPrice(product.originalPrice)}</del><span>{discount}% off</span></div></div>
    </article>
  })}</div>
}

function ShopPage() {
  const [params, setParams] = useSearchParams()
  const requestedCategory = params.get('category') ?? 'All styles'
  const category = categories.includes(requestedCategory) ? requestedCategory : 'All styles'
  const [sort, setSort] = useState('featured')
  const query = params.get('q') ?? ''
  const items = useMemo(() => {
    const filtered = products.filter((product) => (category === 'All styles' || product.category === category) && `${product.name} ${product.category}`.toLowerCase().includes(query.toLowerCase().trim()))
    if (sort === 'price-low') return [...filtered].sort((a, b) => a.price - b.price)
    if (sort === 'price-high') return [...filtered].sort((a, b) => b.price - a.price)
    if (sort === 'top-rated') return [...filtered].sort((a, b) => b.rating - a.rating)
    return filtered
  }, [category, query, sort])
  const selectCategory = (next: string) => { setParams((current) => { const nextParams = new URLSearchParams(current); if (next === 'All styles') nextParams.delete('category'); else nextParams.set('category', next); return nextParams }) }
  return <>
    <PageIntro eyebrow="THE FULL COLLECTION" title="Made for your everyday." description="The good stuff, all in one place. Find your next favourite." />
    <div className="shop-page-wrap"><div className="shop-layout"><aside className="shop-sidebar"><span className="sidebar-label">CATEGORIES</span>{categories.map((item) => <button key={item} className={category === item ? 'sidebar-active' : ''} onClick={() => selectCategory(item)}>{item}<span>{item === 'All styles' ? products.length : products.filter((product) => product.category === item).length}</span></button>)}<div className="sidebar-note"><span>✳</span><b>Good style<br />doesn't have to<br />cost the earth.</b><small>Everyday prices, always.</small></div></aside><section className="shop-main"><div className="shop-topline"><div><strong>{query ? `Results for “${query}”` : category}</strong><span>{items.length} styles</span></div><label className="sort-control"><span>Sort by</span><select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort products"><option value="featured">Featured</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="top-rated">Top rated</option></select></label></div><div className="mobile-category-tabs">{categories.map((item) => <button className={category === item ? 'category-active' : ''} key={item} onClick={() => selectCategory(item)}>{item}</button>)}</div>{items.length ? <ProductGrid items={items} /> : <EmptyState title="No styles found" description="Try another search or browse the full collection." action="Show all styles" onClick={() => setParams({})} />}</section></div></div>
  </>
}

function ProductPage() {
  const { productId } = useParams()
  const product = products.find((item) => item.id === Number(productId))
  const { addToCart, wishlist, toggleWishlist } = useStore()
  const [size, setSize] = useState('')
  const [quantity, setQuantity] = useState(1)
  const navigate = useNavigate()
  if (!product) return <NotFoundPage />
  const saved = wishlist.includes(product.id)
  const discount = Math.round((1 - product.price / product.originalPrice) * 100)
  const add = () => { if (!size) { document.getElementById('size-choices')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); return } addToCart(product, size, quantity); navigate('/cart') }
  return <div className="product-detail-page"><div className="breadcrumbs"><Link to="/">Home</Link><span>/</span><Link to={`/shop?category=${encodeURIComponent(product.category)}`}>{product.category}</Link><span>/</span><span>{product.name}</span></div><div className="product-detail"><div className="detail-gallery"><div className={`detail-main-image ${product.tone}`}><img src={imageUrl(product.image, 1100)} alt={product.name} /><span className="product-label">{product.label ?? `${discount}% OFF`}</span></div><div className="detail-image-note">✳ &nbsp; Made for comfort. Made for your everyday.</div></div><section className="detail-information"><span className="eyebrow">AARON EVERYDAY</span><h1>{product.name}</h1><div className="detail-rating"><span className="rating">★ {product.rating}</span><a href="#reviews">{product.reviews} reviews</a><span>·</span><span>Trusted favourite</span></div><div className="detail-prices"><strong>{formatPrice(product.price)}</strong><del>{formatPrice(product.originalPrice)}</del><span>{discount}% off</span></div><p className="tax-note">Inclusive of all taxes</p><div className="detail-rule" /><p className="detail-description">{product.description}</p><p className="fabric-note"><b>THE FEEL</b>{product.fabric}</p><div className="size-heading" id="size-choices"><b>Select your size</b><button onClick={() => (document.getElementById('size-guide') as HTMLDialogElement | null)?.showModal()}>Size guide <span>↗</span></button></div><div className="size-options" role="group" aria-label="Select size">{['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((option) => <button key={option} className={size === option ? 'size-selected' : ''} aria-pressed={size === option} onClick={() => setSize(option)}>{option}</button>)}</div>{!size && <small className="size-hint">Choose a size to add this style to your bag.</small>}<div className="detail-actions"><div className="quantity-control"><button aria-label="Decrease quantity" onClick={() => setQuantity((q) => Math.max(1, q - 1))}><Icon name="minus" size={14} /></button><span>{quantity}</span><button aria-label="Increase quantity" onClick={() => setQuantity((q) => Math.min(10, q + 1))}><Icon name="plus" size={14} /></button></div><button className="button button-dark detail-add" onClick={add}>Add to bag <Icon name="bag" size={17} /></button><button className={`detail-wishlist ${saved ? 'is-saved' : ''}`} aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'} onClick={() => toggleWishlist(product.id)}><Icon name="heart" /></button></div><div className="delivery-card"><Icon name="truck" size={20} /><div><b>Good things are on their way</b><span>Free shipping on orders over ₹999 · Easy 7-day returns</span></div></div><details className="detail-accordion"><summary>Details & care <span>＋</span></summary><p>{product.description} {product.fabric}</p></details><details className="detail-accordion"><summary>Shipping & returns <span>＋</span></summary><p>We currently deliver across India. Returns are accepted within 7 days of delivery when items are unused and in original condition. Shipping estimates are shown at checkout.</p></details><dialog id="size-guide" className="size-dialog"><button className="dialog-close" aria-label="Close size guide" onClick={() => (document.getElementById('size-guide') as HTMLDialogElement | null)?.close()}><Icon name="close" /></button><span className="eyebrow">YOUR COMFORT COMES FIRST</span><h2>Find your fit</h2><p>Our styles are designed for an easy, comfortable fit. If you prefer a closer fit, consider sizing down.</p><table><thead><tr><th>Size</th><th>Bust (in)</th><th>Waist (in)</th></tr></thead><tbody><tr><td>XS</td><td>32–34</td><td>26–28</td></tr><tr><td>S</td><td>34–36</td><td>28–30</td></tr><tr><td>M</td><td>36–38</td><td>30–32</td></tr><tr><td>L</td><td>38–40</td><td>32–34</td></tr><tr><td>XL</td><td>40–42</td><td>34–36</td></tr><tr><td>XXL</td><td>42–44</td><td>36–38</td></tr></tbody></table></dialog></section></div><div id="reviews"><ProductShelf title="A little more to love" label="YOU MAY ALSO LIKE" items={products.filter((item) => item.id !== product.id).slice(0, 4)} /></div></div>
}

function WishlistPage() {
  const { wishlist } = useStore()
  const items = products.filter((product) => wishlist.includes(product.id))
  return <><PageIntro eyebrow="SAVED FOR LATER" title="Your little love list." description="The pieces you liked, all together in one lovely place." />{items.length ? <section className="saved-page-content"><div className="shop-topline"><div><strong>Your saved styles</strong><span>{items.length} {items.length === 1 ? 'style' : 'styles'}</span></div><Link className="text-link" to="/shop">Keep browsing <Icon name="arrow" size={15} /></Link></div><ProductGrid items={items} /></section> : <EmptyState title="A little empty, for now." description="Tap the heart on any style you love, and it will be waiting here." action="Explore the collection" to="/shop" />}</>
}

function CartPage() {
  const { cart, changeQuantity } = useStore()
  const subtotal = cart.reduce((total, entry) => total + entry.product.price * entry.quantity, 0)
  const shipping = subtotal >= 999 || subtotal === 0 ? 0 : 79
  const remaining = Math.max(0, 999 - subtotal)
  return <section className="cart-page"><div className="cart-page-heading"><div className="breadcrumbs"><Link to="/">Home</Link><span>/</span><span>Your bag</span></div><span className="eyebrow">A FEW GOOD FINDS</span><h1>Your bag<span className="cart-page-count">{cart.reduce((total, item) => total + item.quantity, 0)}</span></h1><p>Take another look. Your favourites are right here.</p></div>{cart.length === 0 ? <EmptyState title="Your bag is waiting for something lovely." description="Your next everyday favourite is only a browse away." action="Find your favourite" to="/shop" /> : <div className="cart-layout"><section className="cart-lines" aria-label="Items in your bag">{remaining > 0 ? <div className="shipping-progress"><div><span>Add {formatPrice(remaining)} more for <b>free shipping</b></span><span>{Math.min(100, Math.round(subtotal / 999 * 100))}%</span></div><div className="progress-track"><span style={{ width: `${Math.min(100, subtotal / 999 * 100)}%` }} /></div></div> : <div className="free-shipping-note">✳ &nbsp; Your order ships free. Nice choice!</div>}{cart.map(({ product, quantity, size }) => <article className="cart-line" key={`${product.id}-${size}`}><Link to={`/product/${product.id}`}><img src={imageUrl(product.image)} alt={product.name} /></Link><div className="cart-line-info"><Link to={`/product/${product.id}`}><h2>{product.name}</h2></Link><span>Size: {size}</span><span>{formatPrice(product.price)} each</span><div className="quantity-control"><button aria-label={`Remove one ${product.name}`} onClick={() => changeQuantity(product.id, size, -1)}><Icon name="minus" size={14} /></button><span>{quantity}</span><button aria-label={`Add one ${product.name}`} onClick={() => changeQuantity(product.id, size, 1)}><Icon name="plus" size={14} /></button></div><button className="remove-line" onClick={() => changeQuantity(product.id, size, -quantity)}>Remove</button></div><strong className="cart-line-total">{formatPrice(product.price * quantity)}</strong></article>)}<Link className="text-link continue-shopping" to="/shop"><span>←</span> Continue shopping</Link></section><aside className="order-summary"><span className="eyebrow">THE ORDER SO FAR</span><h2>Order summary</h2><div className="summary-row"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div><div className="summary-row"><span>Shipping</span><span>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span></div><p className="summary-shipping-note">{shipping === 0 ? 'Your good finds ship free.' : `Add ${formatPrice(remaining)} more for free shipping.`}</p><div className="summary-total"><b>Total</b><strong>{formatPrice(subtotal + shipping)}</strong></div><small className="tax-note">Inclusive of all taxes</small><Link className="button button-dark checkout-button" to="/checkout">Continue to checkout <Icon name="arrow" size={17} /></Link><div className="summary-trust"><Icon name="shield" size={17} /> Secure checkout · Easy 7-day returns</div></aside></div>}</section>
}

function CheckoutPage({ clearCart, notify }: { clearCart: () => void; notify: (message: string) => void }) {
  const { cart } = useStore()
  const [placed, setPlaced] = useState(false)
  const subtotal = cart.reduce((total, entry) => total + entry.product.price * entry.quantity, 0)
  const shipping = subtotal >= 999 || subtotal === 0 ? 0 : 79
  if (placed) return <section className="checkout-success"><span className="success-mark">✓</span><span className="eyebrow">THAT'S A WRAP</span><h1>Thank you for your order.</h1><p>This is a demo checkout, so no payment was taken and no order was sent. Your Aaron Garments prototype is ready for a real checkout integration.</p><Link to="/shop" className="button button-dark">Back to the collection</Link></section>
  return <section className="checkout-page"><div className="breadcrumbs"><Link to="/">Home</Link><span>/</span><Link to="/cart">Your bag</Link><span>/</span><span>Checkout</span></div><div className="checkout-heading"><span className="eyebrow">ALMOST YOURS</span><h1>Checkout</h1><p>A few details and these good finds are on their way.</p></div>{cart.length === 0 ? <EmptyState title="Your bag is taking a little break." description="Add a style to your bag before heading to checkout." action="Browse the collection" to="/shop" /> : <form className="checkout-layout" onSubmit={(event) => { event.preventDefault(); clearCart(); setPlaced(true); notify('Order demo complete') }}><div className="checkout-form"><div className="checkout-step"><span>01</span><div><h2>Contact</h2><p>Where should we send your order updates?</p></div></div><label>Email address<input type="email" autoComplete="email" required placeholder="you@example.com" /></label><div className="checkout-step"><span>02</span><div><h2>Delivery address</h2><p>We'll deliver your good finds right to your door.</p></div></div><div className="form-grid"><label>First name<input autoComplete="given-name" required placeholder="Your first name" /></label><label>Last name<input autoComplete="family-name" required placeholder="Your last name" /></label></div><label>Phone number<input type="tel" autoComplete="tel" required pattern="[0-9]{10}" placeholder="10-digit mobile number" /></label><label>Address<input autoComplete="street-address" required placeholder="House number and street" /></label><div className="form-grid"><label>City<input autoComplete="address-level2" required placeholder="City" /></label><label>PIN code<input autoComplete="postal-code" required pattern="[0-9]{6}" maxLength={6} placeholder="6-digit PIN" /></label></div><div className="checkout-step payment-step"><span>03</span><div><h2>Payment</h2><p>Payment integration is not connected in this prototype.</p></div></div><div className="demo-payment"><span className="demo-lock"><Icon name="shield" size={20} /></span><span><b>Demo checkout</b><small>Submitting places a local demo order. No payment or real order is processed.</small></span></div><button className="button button-dark place-order" type="submit">Place demo order <Icon name="arrow" size={17} /></button></div><aside className="order-summary checkout-summary"><span className="eyebrow">YOUR GOOD FINDS</span><h2>Order summary</h2>{cart.map(({ product, quantity, size }) => <div className="checkout-item" key={`${product.id}-${size}`}><img src={imageUrl(product.image)} alt="" /><div><b>{product.name}</b><small>Size {size} · Qty {quantity}</small></div><strong>{formatPrice(product.price * quantity)}</strong></div>)}<div className="summary-row"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div><div className="summary-row"><span>Shipping</span><span>{shipping ? formatPrice(shipping) : 'FREE'}</span></div><div className="summary-total"><b>Total</b><strong>{formatPrice(subtotal + shipping)}</strong></div></aside></form>}</section>
}

function AboutPage() {
  return <><section className="about-hero"><div className="about-image" /><div className="about-copy"><span className="eyebrow">A NOTE FROM AARON</span><h1>Getting dressed<br />should feel <em>good.</em></h1><p>We started Aaron Garments with one small idea: the clothes you wear every day deserve to feel just as special as the big-occasion ones.</p><p>So we make thoughtful, comfortable pieces with the little details that make you feel like yourself—at prices that make sense for real life.</p><Link className="button button-dark" to="/shop">Find your everyday <Icon name="arrow" size={17} /></Link></div></section><TrustStrip /><section className="about-values"><span className="eyebrow">THE AARON WAY</span><h2>Feel-good style, without the fuss.</h2><div className="value-grid"><article><span>01</span><h3>Comfort comes first</h3><p>Easy fits, soft fabrics, and clothes that move with your actual day.</p></article><article><span>02</span><h3>Good value, always</h3><p>Thoughtful style at everyday prices. No special occasion required.</p></article><article><span>03</span><h3>Made to be worn</h3><p>Pieces for the real moments, the repeat days, and everything between.</p></article></div></section></>
}

function HelpPage() {
  return <section className="help-page"><PageIntro eyebrow="HERE FOR YOU" title="A little help, right here." description="The quick answers to the things you might be wondering." /><div className="help-content"><div className="help-contact"><span className="eyebrow">STILL HAVE A QUESTION?</span><h2>We are happy to help.</h2><p>For this storefront demo, customer support is not connected yet. In a live shop, this is where your support team can be reached.</p><Link className="button button-outline" to="/shop">Keep browsing <Icon name="arrow" size={15} /></Link></div><div className="help-faq">{[['How long does delivery take?', 'Delivery timing depends on your location. A live store should show an accurate estimate at checkout after your PIN code is entered.'], ['Can I return or exchange an item?', 'We offer a demo 7-day return promise in this prototype. Connect a returns workflow and publish the final policy before accepting live orders.'], ['How do I choose my size?', 'Open any product page and use the size guide near the size selector. The chart is a starting point; garment measurements should be added for your final catalog.'], ['What payment methods can I use?', 'Payments are not connected. This storefront does not collect card or UPI details and cannot process a real order.']].map(([question, answer]) => <details className="help-question" key={question}><summary>{question}<span>＋</span></summary><p>{answer}</p></details>)}</div></div></section>
}

function SiteFooter() {
  return <footer className="site-footer"><div className="footer-top"><Link className="wordmark footer-wordmark" to="/"><span className="wordmark-mark">A</span><span>AARON <b>GARMENTS</b><small>MADE FOR YOUR EVERYDAY</small></span></Link><p>Made for your everyday, and every version of you.</p><div className="footer-social"><span>GOOD STYLE, GOOD DAYS</span><span>✳ &nbsp; Made with care</span></div></div><div className="footer-bottom"><span>© 2026 Aaron Garments</span><div><Link to="/shop">Shop</Link><Link to="/about">Our story</Link><Link to="/help">Help & FAQs</Link><Link to="/cart">Your bag</Link></div><span>Product photography for prototype use</span></div></footer>
}

function PageIntro({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <section className="page-intro"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></section>
}

function EmptyState({ title, description, action, to, onClick }: { title: string; description: string; action: string; to?: string; onClick?: () => void }) {
  return <section className="empty-state"><span className="empty-state-mark">✳</span><h2>{title}</h2><p>{description}</p>{to ? <Link className="button button-dark" to={to}>{action} <Icon name="arrow" size={16} /></Link> : <button className="button button-dark" onClick={onClick}>{action} <Icon name="arrow" size={16} /></button>}</section>
}

function NotFoundPage() {
  return <section className="not-found"><span className="eyebrow">A WRONG TURN, MAYBE?</span><h1>That page wandered off.</h1><p>Let's get you back to the good stuff.</p><Link className="button button-dark" to="/">Go home <Icon name="arrow" size={16} /></Link></section>
}

export default App
