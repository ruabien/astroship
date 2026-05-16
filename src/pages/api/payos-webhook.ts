import type { APIRoute } from 'astro';

export const POST: APIRoute = async (context) => {
  try {
    // Trả về kết quả thành công ngay lập tức cho bất kỳ tín hiệu nào gửi tới để thông mạch cổng kết nối
    return new Response(JSON.stringify({ 
      error: 0, 
      message: "Ok", 
      data: null 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 0, message: "Ok" }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// Hỗ trợ thêm cả phương thức GET đề phòng PayOS quét kiểm tra định kỳ
export const GET: APIRoute = async () => {
  return new Response(JSON.stringify({ error: 0, message: "Webhook Online" }), { status: 200 });
};
