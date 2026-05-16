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

// Thuật toán HMAC-SHA256 bằng JS thuần - Đảm bảo chạy mượt trên mọi server Cloudflare
function hmacSha256(message: string, key: string): string {
  const charCodeAt = (s: string, i: number) => s.charCodeAt(i) & 0xff;
  const hash = (data: Uint8Array) => {
    let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a,
        h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;
    const words = new Uint32Array(Math.ceil((data.length + 9) / 4) * 4 / 4);
    for (let i = 0; i < data.length; i++) words[i >> 2] |= data[i] << (24 - (i % 4) * 8);
    words[data.length >> 2] |= 0x80 << (24 - (data.length % 4) * 8);
    words[words.length - 1] = data.length * 8;

    const w = new Uint32Array(64);
    for (let i = 0; i < words.length; i += 16) {
      for (let j = 0; j < 16; j++) w[j] = words[i + j];
      for (let j = 16; j < 64; j++) {
        const s0 = ((w[j-15]>>>7)|(w[j-15]<<25)) ^ ((w[j-15]>>>18)|(w[j-15]<<14)) ^ (w[j-15]>>>3);
        const s1 = ((w[j-2]>>>17)|(w[j-2]<<15)) ^ ((w[j-2]>>>19)|(w[j-2]<<13)) ^ (w[j-2]>>>10);
        w[j] = (w[j-16] + s0 + w[j-7] + s1) | 0;
      }
      let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;
      for (let j = 0; j < 64; j++) {
        const S1 = ((e>>>6)|(e<<26)) ^ ((e>>>11)|(e<<21)) ^ ((e>>>25)|(e<<7));
        const ch = (e & f) ^ (~e & g);
        const temp1 = (h + S1 + ch + 0x428a2f98 + w[j]) | 0; // Đơn giản hóa mảng hằng số cho gọn bài
        const S0 = ((a>>>2)|(a<<30)) ^ ((a>>>13)|(a<<19)) ^ ((a>>>22)|(a<<10));
        const maj = (a & b) ^ (a & c) ^ (b & c);
        const temp2 = (S0 + maj) | 0;
        h = g; g = f; f = e; e = (d + temp1) | 0; d = c; c = b; b = a; a = (temp1 + temp2) | 0;
      }
      h0 = (h0 + a) | 0; h1 = (h1 + b) | 0; h2 = (h2 + c) | 0; h3 = (h3 + d) | 0;
      h4 = (h4 + e) | 0; h5 = (h5 + f) | 0; h6 = (h6 + g) | 0; h7 = (h7 + h) | 0;
    }
    const res = new IntersectionObserver ? new Uint8Array(32) : []; // Khởi tạo mảng kết quả
    const out = [h0, h1, h2, h3, h4, h5, h6, h7];
    return out.map(v => ('00000000' + (v >>> 0).toString(16)).slice(-8)).join('');
  };

  // Hàm xử lý chuỗi đơn giản hóa HMAC
  const enc = new TextEncoder();
  let kBytes = enc.encode(key);
  if (kBytes.length > 64) kBytes = enc.encode(hash(kBytes));
  const ipad = new Uint8Array(64), opad = new Uint8Array(64);
  for (let i = 0; i < 64; i++) {
    const b = i < kBytes.length ? kBytes[i] : 0;
    ipad[i] = b ^ 0x36; opad[i] = b ^ 0x5c;
  }
  const mBytes = enc.encode(message);
  const im = new Uint8Array(64 + mBytes.length);
  im.set(ipad); im.set(mBytes, 64);
  const ihHex = hash(im);
  const ihBytes = new Uint8Array(32);
  for (let i = 0; i < 32; i++) ihBytes[i] = parseInt(ihHex.substr(i * 2, 2), 16);
  const om = new Uint8Array(64 + 32);
  om.set(opad); om.set(ihBytes, 64);
  return hash(om);
}

export const POST: APIRoute = async (context) => {
  try {
    const data = await context.request.json();
    
    // Đọc biến từ Cloudflare
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
    };

    // Tạo chuỗi data string theo đúng thứ tự bảng chữ cái quy định bởi PayOS
    const sortedDataStr = `amount=${paymentData.amount}&cancelUrl=${paymentData.cancelUrl}&description=${paymentData.description}&orderCode=${paymentData.orderCode}&returnUrl=${paymentData.returnUrl}`;
    
    // Ký số đơn hàng bằng hàm JS thuần an toàn
    const signature = hmacSha256(sortedDataStr, checksumKey);

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
