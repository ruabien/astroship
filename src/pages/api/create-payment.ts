import type { APIRoute } from 'astro';
import crypto from 'node:crypto';

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
    
    // Nạp mã bí mật bảo mật từ Cloudflare
    // @ts-ignore
    const envs = context.locals.runtime?.env || globalThis || process?.env || {};
    const clientId = envs.PAYOS_CLIENT_ID || "";
    const apiKey = envs.PAYOS_API_KEY || "";
    const checksumKey = envs.PAYOS_CHECKSUM_KEY || "";

    // Đồng bộ chuỗi mô tả sạch
    let description = data.description || `Mua ${data.title}`;
    description = removeVietnameseTones(description).substring(0, 20).trim();
    
    // Tạo mã đơn hàng ngẫu nhiên cố định độ dài
    const orderCode = Math.floor(100000 + Math.random() * 899999);

    const paymentData = {
      orderCode: orderCode,
      amount: Number(data.price),
      description: description,
      cancelUrl: 'https://hotro.online/payment-cancel',
      returnUrl: 'https://hotro.online/payment-success',
    };

    // Tạo chuỗi ký số
    const sortedDataStr = `amount=${paymentData.amount}&cancelUrl=${paymentData.cancelUrl}&description=${paymentData.description}&orderCode=${paymentData.orderCode}&returnUrl=${paymentData.returnUrl}`;
    
    const signature = crypto
      .createHmac('sha256', checksumKey.trim())
      .update(sortedDataStr)
      .digest('hex');

    const bodyToSend = { ...paymentData, signature };

    const response = await fetch('https://api-merchant.payos.vn/v2/payment-requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': clientId.trim(),
        'x-api-key': apiKey.trim(),
      },
      body: JSON.stringify(bodyToSend),
    });

    const result = await response.json();
    
    // SỬA ĐỔI QUYẾT ĐỊNH: Chấp nhận cả mã lỗi bằng số 0 hoặc chuỗi "00" chuẩn Live PayOS
    if ((result.error === 0 || result.code === "00") && (result.data?.checkoutUrl || result.checkoutUrl)) {
      const url = result.data?.checkoutUrl || result.checkoutUrl;
      return new Response(JSON.stringify({ checkoutUrl: url }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({ error: result.desc || 'PayOS tu choi' }), { status: 400 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
};
