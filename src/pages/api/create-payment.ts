import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    
    // Cấu hình đơn hàng gửi sang PayOS
    const paymentData = {
      orderCode: Math.floor(Math.random() * 1000000), // Tạo mã đơn hàng ngẫu nhiên
      amount: data.price, // Giá tiền từ client gửi lên
      description: `Mua ${data.title.substring(0, 15)}`, // Mô tả ngắn dưới 20 ký tự
      cancelUrl: 'https://astroship-cuv.pages.dev/payment-cancel', // Trang khi khách hủy
      returnUrl: 'https://astroship-cuv.pages.dev/payment-success', // Trang khi thành công
    };

    // Gọi API của PayOS để tạo link thanh toán chứa mã QR
    const response = await fetch('https://api-merchant.payos.vn/v2/payment-requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': process.env.PAYOS_CLIENT_ID || '',
        'x-api-key': process.env.PAYOS_API_KEY || '',
      },
      body: JSON.stringify(paymentData),
    });

    const result = await response.json();
    
    // Trả link thanh toán về cho giao diện
    return new Response(JSON.stringify({ checkoutUrl: result.data.checkoutUrl }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Lỗi tạo thanh toán' }), { status: 500 });
  }
};
