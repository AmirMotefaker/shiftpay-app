// src/app/api/payment/request/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generatePaymentLink } from '@/lib/mockPSP';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { merchantId, amount, orderRef } = body;

    // اعتبارسنجی ورودی‌ها
    if (!merchantId || !amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid input data' }, { status: 400 });
    }

    // ۱. ثبت تراکنش در دیتابیس با وضعیت PENDING
    const transaction = await prisma.transaction.create({
      data: {
        merchantId,
        amount: Number(amount),
        orderRef: orderRef || null,
        type: 'DEPOSIT',
        status: 'PENDING',
      },
    });

    // ۲. درخواست لینک پرداخت به شبیه‌ساز بانک (یا PSP واقعی در آینده)
    const pspResponse = await generatePaymentLink(transaction.amount, transaction.id);

    return NextResponse.json({
      status: 'success',
      transactionId: transaction.id,
      paymentLink: pspResponse.link,
      authority: pspResponse.authority,
    });

  } catch (error) {
    console.error('Payment Request Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}