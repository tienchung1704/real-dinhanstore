import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-001:generateContent?key=${GEMINI_API_KEY}`;

const SYSTEM_PROMPT = `Bạn là trợ lý AI của Dinhan Store - cửa hàng chuyên bán đồ cầu lông chính hãng.

Thông tin về cửa hàng:
- Tên: Dinhan Store
- Chuyên: Vợt cầu lông, giày, quần áo, phụ kiện cầu lông
- Thương hiệu: Yonex, Victor, Lining, Mizuno, Kawasaki
- Địa chỉ: 123 Đường ABC, Quận 1, TP.HCM
- Hotline: 0901 234 567
- Email: info@dinhanstore.com

Chính sách:
- Miễn phí ship đơn từ 500K
- Bảo hành chính hãng
- Đổi trả trong 30 ngày
- Giao hàng trong 24h nội thành

Hãy trả lời ngắn gọn, thân thiện và hữu ích. Nếu khách hỏi về sản phẩm cụ thể mà bạn không biết, hãy gợi ý họ xem trang sản phẩm hoặc liên hệ hotline.`;

export async function POST(request: NextRequest) {
  try {
    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 }
      );
    }

    const { messages } = await request.json();

    // Build conversation history for Gemini
    const contents = [
      {
        role: "user",
        parts: [{ text: SYSTEM_PROMPT }]
      },
      {
        role: "model", 
        parts: [{ text: "Xin chào! Tôi là trợ lý AI của Dinhan Store. Tôi có thể giúp bạn tìm hiểu về sản phẩm cầu lông, chính sách cửa hàng, hoặc hỗ trợ đặt hàng. Bạn cần hỗ trợ gì ạ?" }]
      },
      ...messages.map((msg: { role: string; content: string }) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }]
      }))
    ];

    const response = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Gemini API error:", error);
      return NextResponse.json(
        { error: "Failed to get response from Gemini" },
        { status: 500 }
      );
    }

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Xin lỗi, tôi không thể trả lời lúc này.";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
