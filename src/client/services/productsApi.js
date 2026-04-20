/**
 * Products API — hiện tại dùng mock data.
 * Khi BE sẵn sàng, thay bằng:
 *   import { fetchJson } from '@/shared/lib/http'
 *   import { env } from '@/shared/config/env'
 */


const MOCK_CATEGORIES = [
  { id: '1', name: 'Sàn Gỗ', slug: 'san-go', description: 'Sàn gỗ cao cấp, bền đẹp, phù hợp mọi không gian nội thất.', image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', product_count: 12 },
  { id: '2', name: 'Tường & Trần', slug: 'tuong-tran', description: 'Vật liệu ốp tường và trần thẩm mỹ cao, cách âm tốt.', image_url: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&q=80', product_count: 8 },
  { id: '3', name: 'Cửa & Vách', slug: 'cua-vach', description: 'Hệ thống cửa gỗ, vách ngăn hiện đại, phong cách tối giản.', image_url: 'https://images.unsplash.com/photo-1558618047-3c8c76ef4b9a?w=600&q=80', product_count: 15 },
  { id: '4', name: 'Nội Thất', slug: 'noi-that', description: 'Nội thất gỗ tự nhiên và công nghiệp, thiết kế theo yêu cầu.', image_url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80', product_count: 20 },
  { id: '5', name: 'Thiết Bị Phòng Tắm', slug: 'thiet-bi-phong-tam', description: 'Bộ sưu tập thiết bị phòng tắm cao cấp, phong cách châu Âu.', image_url: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600&q=80', product_count: 9 },
  { id: '6', name: 'Đèn & Chiếu Sáng', slug: 'den-chieu-sang', description: 'Hệ thống đèn chiếu sáng nghệ thuật và chức năng.', image_url: 'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=600&q=80', product_count: 7 },
]

const MOCK_PRODUCTS = [
  {
    id: '101', sku: 'FLR-OAK-001', name: 'Sàn Gỗ Sồi Tự Nhiên', slug: 'san-go-soi-tu-nhien',
    category_id: '1', category_name: 'Sàn Gỗ',
    short_desc: 'Sàn gỗ sồi nguyên khối nhập khẩu Châu Âu, vân gỗ tự nhiên, độ bền cao.',
    full_desc: 'Sàn gỗ sồi tự nhiên được khai thác từ rừng trồng bền vững tại Châu Âu. Qua công nghệ xử lý nhiệt tiên tiến, sản phẩm đạt độ cứng cao, chống ẩm mốc và mối mọt vượt trội. Lớp phủ UV lacquer 7 lớp giúp bề mặt bóng đẹp, dễ vệ sinh.',
    size: '1220 × 150 × 15 mm',
    material: 'Gỗ Sồi Trắng (Oak)',
    color: 'Nâu vàng tự nhiên, Brown Nordic',
    use_case: 'Phòng ngủ, phòng khách, văn phòng, khách sạn 4–5 sao',
    video_url: '',
    catalog_pdf_url: '',
    images: [
      { url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&q=80', alt: 'Sàn gỗ sồi góc nhìn 1' },
      { url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=900&q=80', alt: 'Sàn gỗ sồi lắp đặt' },
      { url: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=900&q=80', alt: 'Chi tiết vân gỗ' },
    ],
  },
  {
    id: '102', sku: 'FLR-WLN-002', name: 'Sàn Gỗ Óc Chó Cao Cấp', slug: 'san-go-oc-cho-cao-cap',
    category_id: '1', category_name: 'Sàn Gỗ',
    short_desc: 'Sàn gỗ óc chó sang trọng, màu tối ấn tượng, phù hợp không gian executive.',
    full_desc: 'Sàn gỗ óc chó (Walnut) – loại gỗ quý được ưa chuộng trong thiết kế nội thất cao cấp. Màu nâu đen đặc trưng, vân gỗ phức tạp tạo chiều sâu thẩm mỹ. Phù hợp với phong cách hiện đại, tối giản và cổ điển.',
    size: '1820 × 130 × 18 mm',
    material: 'Gỗ Óc Chó Mỹ (American Walnut)',
    color: 'Nâu đen, Dark Espresso',
    use_case: 'Phòng giám đốc, phòng họp VIP, biệt thự cao cấp',
    video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    catalog_pdf_url: '#',
    images: [
      { url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=900&q=80', alt: 'Sàn óc chó' },
      { url: 'https://images.unsplash.com/photo-1615529162924-f8605388461d?w=900&q=80', alt: 'Chi tiết vân óc chó' },
    ],
  },
  {
    id: '201', sku: 'WAL-PNL-001', name: 'Tấm Ốp Tường PVC Vân Đá', slug: 'tam-op-tuong-pvc-van-da',
    category_id: '2', category_name: 'Tường & Trần',
    short_desc: 'Tấm ốp tường cao cấp giả đá marble, chống ẩm, dễ lắp đặt, thẩm mỹ cao.',
    full_desc: 'Tấm ốp tường PVC vân đá marble được sản xuất bằng công nghệ in UV hiện đại. Bề mặt sắc nét, chân thực như đá tự nhiên nhưng trọng lượng nhẹ hơn 70%, cắt giảm chi phí vận chuyển và lắp đặt.',
    size: '2800 × 600 × 9 mm',
    material: 'PVC cao cấp + lớp phủ UV',
    color: 'Marble trắng Carrara, Nero Marquina đen',
    use_case: 'Hành lang khách sạn, sảnh reception, phòng tắm',
    video_url: '',
    catalog_pdf_url: '#',
    images: [
      { url: 'https://images.unsplash.com/photo-1561103575-166bf735b2f5?w=900&q=80', alt: 'Tấm ốp tường đá marble' },
      { url: 'https://images.unsplash.com/photo-1558618047-3c8c76ef4b9a?w=900&q=80', alt: 'Thi công ốp tường' },
    ],
  },
  {
    id: '301', sku: 'DOR-WD-001', name: 'Cửa Gỗ Tự Nhiên Căm Xe', slug: 'cua-go-tu-nhien-cam-xe',
    category_id: '3', category_name: 'Cửa & Vách',
    short_desc: 'Cửa gỗ căm xe nguyên khối, cách âm tốt, chống cong vênh, bảo hành 5 năm.',
    full_desc: 'Cửa gỗ căm xe được sản xuất từ gỗ tự nhiên chọn lọc kỹ càng. Qua quy trình sấy khô kiểm soát độ ẩm dưới 12%, sản phẩm đảm bảo không cong vênh trong điều kiện khí hậu nhiệt đới. Hệ khung nhôm gia cường tạo độ bền tối đa.',
    size: '900 × 2100 × 45 mm (chuẩn) — custom theo yêu cầu',
    material: 'Gỗ Căm Xe tự nhiên',
    color: 'Màu tự nhiên, màu walnut, màu trắng sữa (theo order)',
    use_case: 'Cửa phòng ngủ, cửa văn phòng, cửa phòng họp',
    video_url: '',
    catalog_pdf_url: '#',
    images: [
      { url: 'https://images.unsplash.com/photo-1558618047-3c8c76ef4b9a?w=900&q=80', alt: 'Cửa gỗ căm xe' },
    ],
  },
  {
    id: '401', sku: 'FRN-SOF-001', name: 'Sofa Da Cao Cấp Module', slug: 'sofa-da-cao-cap-module',
    category_id: '4', category_name: 'Nội Thất',
    short_desc: 'Bộ sofa module da thật Italia, khung gỗ sồi, đệm cao su tự nhiên mật độ cao.',
    full_desc: 'Sofa module thiết kế linh hoạt, có thể kết hợp nhiều cấu hình tùy không gian. Da thật nhập khẩu từ Italia, khâu thủ công tỉ mỉ. Khung gỗ sồi tự nhiên, đệm cao su tự nhiên mật độ 38D bảo đảm êm ái và bền bỉ.',
    size: 'Module 90×90 cm, nhiều cấu hình ghép nối',
    material: 'Da thật Italia + Khung Gỗ Sồi + Cao su tự nhiên',
    color: 'Da đen, da caramel, da trắng kem',
    use_case: 'Phòng khách biệt thự, lounge khách sạn, showroom',
    video_url: '',
    catalog_pdf_url: '',
    images: [
      { url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=900&q=80', alt: 'Sofa module' },
      { url: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=900&q=80', alt: 'Sofa phòng khách' },
    ],
  },
  {
    id: '501', sku: 'BTH-SET-001', name: 'Bộ Thiết Bị Vệ Sinh Châu Âu', slug: 'bo-thiet-bi-ve-sinh-chau-au',
    category_id: '5', category_name: 'Thiết Bị Phòng Tắm',
    short_desc: 'Trọn bộ lavabo, bồn cầu, vòi hoa sen thương hiệu châu Âu, thiết kế minimalist.',
    full_desc: 'Bộ thiết bị phòng tắm nhập khẩu châu Âu đáp ứng tiêu chuẩn CE. Lavabo sứ siêu bóng, bồn cầu one-piece tiết kiệm nước 4.5L/lần xả, vòi hoa sen rain-shower nhiều chế độ. Phù hợp dự án khách sạn 4–5 sao và biệt thự cao cấp.',
    size: 'Theo thông số từng model (bộ sản phẩm)',
    material: 'Sứ cao cấp + Inox 304',
    color: 'Trắng matte, Chrome bóng, Matte Black',
    use_case: 'Phòng tắm khách sạn, spa, biệt thự',
    video_url: '',
    catalog_pdf_url: '#',
    images: [
      { url: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=900&q=80', alt: 'Thiết bị phòng tắm' },
    ],
  },
]

// ─── API Functions ───────────────────────────────────────────────────────────

export async function listProductCategories() {
  // TODO: thay bằng fetch thật khi BE sẵn sàng:
  // const res = await fetch(`${getApiBase()}/public/product-categories`)
  // return res.json()
  await _delay(400)
  return { items: MOCK_CATEGORIES, pagination: { total: MOCK_CATEGORIES.length } }
}

export async function listProducts({ categorySlug = '', skip = 0, limit = 12 } = {}) {
  // TODO: thay bằng fetch thật:
  // const params = new URLSearchParams({ skip, limit, ...(categorySlug && { category_slug: categorySlug }) })
  // const res = await fetch(`${getApiBase()}/public/products?${params}`)
  // return res.json()
  await _delay(500)
  const filtered = categorySlug
    ? MOCK_PRODUCTS.filter(p => {
        const cat = MOCK_CATEGORIES.find(c => c.slug === categorySlug)
        return cat && p.category_id === cat.id
      })
    : MOCK_PRODUCTS
  const paged = filtered.slice(skip, skip + limit)
  return { items: paged, pagination: { total: filtered.length, skip, limit } }
}

export async function getProduct(slug) {
  // TODO: thay bằng fetch thật:
  // const res = await fetch(`${getApiBase()}/public/products/${slug}`)
  // return res.json()
  await _delay(300)
  const product = MOCK_PRODUCTS.find(p => p.slug === slug)
  if (!product) throw new Error('Sản phẩm không tìm thấy')
  // Thêm related products cùng category
  const related = MOCK_PRODUCTS.filter(p => p.category_id === product.category_id && p.id !== product.id).slice(0, 3)
  return { ...product, related_products: related }
}

export async function submitInquiry(payload) {
  // TODO: thay bằng fetch thật:
  // const res = await fetch(`${getApiBase()}/public/inquiries`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(payload),
  // })
  // if (!res.ok) throw new Error('Gửi yêu cầu thất bại')
  // return res.json()
  await _delay(800)
  console.log('[Mock] Inquiry submitted:', payload)
  return { success: true, message: 'Yêu cầu đã được ghi nhận. Chúng tôi sẽ liên hệ trong vòng 24 giờ.' }
}

// ─── Helper ──────────────────────────────────────────────────────────────────

function _delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
