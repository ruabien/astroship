import type { APIRoute } from 'astro';

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

// Thuật toán tạo chữ ký Webhook SHA256 bắt buộc của cổng PayOS v2
async function generateSignature(data: any, checksumKey: string) {
  const sortedData = `amount=${data.amount}&cancelUrl=${data.cancelUrl}&description=${data.description}&orderCode=${data.orderCode}&returnUrl=${data.returnUrl}`;
  const encoder = new TextEncoder();
  const keyBuf = encoder.encode(checksumKey);
  const dataBuf = encoder.encode(sortedData);
  
  const cryptoKey = await crypto.subtle.importKey(
    "raw", keyBuf, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const signatureBuf = await crypto.subtle.sign("HMAC", cryptoKey, dataBuf);
  return Array.from(new Uint8Array(signatureBuf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

export const POST: APIRoute = async (context) => {
  try {
    const data = await context.request.json();
    
    // Nạp biến môi trường từ Cloudflare Pages
    // @ts-ignore
    const envs = context.locals.runtime?.env || process.env || globalThis || {};
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
      signature: ""
    };

    // Ký số đơn hàng bằng Checksum Key trước khi gửi đi
    paymentData.signature = await generateSignature(paymentData, checksumKey);

    const response = await fetch('https://api-merchant.payos.vn/v2/payment-requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': clientId,
        'x-api-key': apiKey,
      },
      body: JSON.stringify(paymentData),
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
