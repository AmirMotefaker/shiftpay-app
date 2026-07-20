// src/app/api/payment/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyPayment } from '@/lib/mockPSP';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { transactionId, authority } = body;

    if (!transactionId || !authority) {
      return NextResponse.json({ error: 'Missing transaction ID or authority' }, { status: 400 });
    }

    // ۱. پیدا کردن تراکنش در دیتابیس
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    if (transaction.status === 'SUCCESS') {
      return NextResponse.json({ message: 'Transaction already verified' });
    }

    // ۲. بررسی صحت پرداخت از شبیه‌ساز بانک (یا PSP واقعی در آینده)
    const verification = await verifyPayment(authority, transaction.amount);

    if (verification.status === 'SUCCESS' && verification.trackingCode) {
      // ۳. موفقیت! آپدیت تراکنش در دیتابیس
      const updatedTransaction = await prisma.transaction.update({
        where: { id: transactionId },
        data: {
          status: 'SUCCESS',
          trackingCode: verification.trackingCode,
        },
      });

      return NextResponse.json({
        status: 'success',
        message: 'Payment verified successfully',
        trackingCode: updatedTransaction.trackingCode,
      });
    } else {
      // عدم موفقیت
      await prisma.transaction.update({
        where: { id: transactionId },
        data: { status: 'FAILED' },
      });

      return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 });
    }

  } catch (error) {
    console.error('Payment Verify Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}