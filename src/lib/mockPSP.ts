// src/lib/mockPSP.ts

// این ماژول شبیه‌ساز درگاه بانک است. بعداً این کدها با API واقعی PSP جایگزین می‌شوند.

export async function generatePaymentLink(amount: number, orderId: string) {
  // در اینجا ما یک لینک فیک می‌سازیم. در دنیای واقعی، این درخواست به سرور PSP ارسال می‌شود
  const fakeAuthority = `MOCK_AUTH_${Date.now()}_${orderId}`;
  const paymentLink = `https://mock-bank.shiftpay.ir/pay?authority=${fakeAuthority}`;
  
  return {
    authority: fakeAuthority,
    link: paymentLink,
  };
}

export async function verifyPayment(authority: string, amount: number) {
  // در شبیه‌ساز، همیشه پرداخت موفق است. در دنیای واقعی، اینجا کد رفرنس بانک چک می‌شود.
  if (authority && amount > 0) {
    return {
      status: 'SUCCESS',
      trackingCode: `TRK_${Math.floor(Math.random() * 1000000)}`,
    };
  }
  return { status: 'FAILED', trackingCode: null };
}