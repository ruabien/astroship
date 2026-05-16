import type { APIRoute } from 'astro';
import crypto from 'node:crypto'; // Sử dụng module mã hóa chính thức của hệ thống

// Hàm lọc dấu tiếng Việt chuẩn quy định PayOS
function removeVietnameseTones(str: string) {
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str.replace(/đ/g, "d");
  str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
  str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
  str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
  str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
  str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
  str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
  str = str.replace(/Đ/g, "D");
  return str.replace(/[^a-zA-Z0-9 ]/g, "");
}

export const POST: APIRoute = async (context) => {
  try {
    const data = await context.request.json();
    
    // Nạp biến môi trường trực tiếp từ Cloudflare Pages Runtime
    // @ts-ignore
    const envs = context.locals.runtime?.env || {};
    const clientId = envs.PAYOS_CLIENT_ID || "";
    const apiKey = envs.PAYOS_API_KEY || "";
    const checksumKey = envs.PAYOS_CHECKSUM_KEY || "";

    const rawDescription = `Mua ${data.title}`;
    const cleanDescription = removeVietnameseTones(rawDescription).substring(0, 20);
    const orderCode = Math.floor(100000 + Math.random() * 900000);

    const paymentData = {
      orderCode: orderCode,
      amount: Number(data.price),
      description: cleanDescription,
      cancelUrl: 'https://astroship-cuv.pages.dev/payment-cancel',
      returnUrl: 'https://astroship-cuv.pages.dev/payment-success',
    };

    // Tạo chuỗi ký số theo quy định chuẩn của PayOS
    const sortedDataStr = `amount=${paymentData.amount}&cancelUrl=${paymentData.cancelUrl}&description=${paymentData.description}&orderCode=${paymentData.orderCode}&returnUrl=${paymentData.returnUrl}`;
    
    // Tạo chữ ký SHA256 chính thống thông qua node:crypto cực kỳ an toàn
    const signature = crypto
      .createHmac('sha256', checksumKey)
      .update(sortedDataStr)
      .digest('hex');

    const bodyToSend = { ...paymentData, signature };

    const response = await fetch('https://api-merchant.payos.vn/v2/payment-requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': clientId,
        'x-api-key': apiKey,
      },
      body: JSON.stringify(bodyToSend),
    });

    const result = await response.json();
    
    if (result.error === 0 && result.data?.checkoutUrl) {
      return new Response(JSON.stringify({ checkoutUrl: result.data.checkoutUrl }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    return new Response(JSON.stringify({ error: result.message || 'PayOS tu choi' }), { status: 400 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
};
