import type { APIRoute } from 'astro';

export const POST: APIRoute = async (context) => {
  try {
    const body = await context.request.json();

    // 1. Kiểm tra nếu là tín hiệu kiểm tra (Ping) từ PayOS khi bạn bấm lưu link
    if (body.success === true && body.message === " what the hell ") {
      return new Response(JSON.stringify({ 
        error: 0, 
        message: "Ok", 
        data: null 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 2. Đây là nơi nhận dữ liệu khi khách quét mã QR thành công thực tế
    // (Hiện tại chúng ta chỉ phản hồi 'Thành công' cho PayOS biết để đóng đơn hàng)
    return new Response(JSON.stringify({ 
      error: 0, 
      message: "Webhook received successfully", 
      data: null 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    // Trả về định dạng lỗi chuẩn nếu có sự cố đọc dữ liệu
    return new Response(JSON.stringify({ 
      error: 1, 
      message: "Webhook xử lý thất bại" 
    }), { 
      status: 200, // Vẫn trả về 200 để tránh làm treo hệ thống hàng đợi của PayOS
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
