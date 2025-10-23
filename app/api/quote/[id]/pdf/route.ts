import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { loadPdfBuffer } from "@/lib/storage";

export async function GET(request: Request, context: { params: { id: string } }) {
  const quoteId = context.params.id;
  const emailParam = new URL(request.url).searchParams.get("email");

  const quote = await prisma.quote.findUnique({
    where: { id: quoteId },
    include: {
      customer: true,
    },
  });

  if (!quote || !quote.pdfPath) {
    return NextResponse.json({ error: "Devis introuvable" }, { status: 404 });
  }

  // TODO: replace email confirmation with signed token when customer accounts are available.
  if (!emailParam || emailParam.toLowerCase() !== quote.customer.email.toLowerCase()) {
    return NextResponse.json(
      { error: "Accès non autorisé à ce devis" },
      { status: 403 },
    );
  }

  try {
    const buffer = await loadPdfBuffer(quote.pdfPath);
    const pdfBytes = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);

    return new NextResponse(pdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${quote.number}.pdf"`,
        "Cache-Control": "private, max-age=86400",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Impossible de charger le PDF" },
      { status: 500 },
    );
  }
}
