import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Input validation
const MAX_TEXT_LENGTH = 2000;
const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 254;
const MAX_POSTCODE_LENGTH = 20;

function sanitize(input: string, maxLen: number): string {
  if (!input || typeof input !== "string") return "";
  // Strip HTML tags
  let clean = input.replace(/<[^>]+>/g, "");
  // Block prompt injection patterns
  if (/SYSTEM:|ignore previous|<script|onerror=|DROP TABLE|; DELETE|\{\{|%\{/i.test(clean)) {
    return "";
  }
  return clean.slice(0, maxLen).trim();
}

function isValidEmail(email: string): boolean {
  if (!email) return true; // optional field
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= MAX_EMAIL_LENGTH;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Allowlisted fields only
    const {
      name,
      email,
      overall_rating,
      ease_of_use,
      useful_features,
      missing_features,
      would_recommend,
      comments,
      postcode_tested,
    } = body;

    // Validate email if provided
    if (email && !isValidEmail(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    // Validate ratings
    const rating = Number(overall_rating);
    const ease = Number(ease_of_use);
    if (rating && (rating < 1 || rating > 5 || !Number.isInteger(rating))) {
      return NextResponse.json({ error: "Invalid rating" }, { status: 400 });
    }
    if (ease && (ease < 1 || ease > 5 || !Number.isInteger(ease))) {
      return NextResponse.json({ error: "Invalid ease_of_use" }, { status: 400 });
    }

    const feedbackData = {
      name: sanitize(name || "", MAX_NAME_LENGTH),
      email: sanitize(email || "", MAX_EMAIL_LENGTH),
      overall_rating: rating || null,
      ease_of_use: ease || null,
      useful_features: sanitize(useful_features || "", MAX_TEXT_LENGTH),
      missing_features: sanitize(missing_features || "", MAX_TEXT_LENGTH),
      would_recommend: typeof would_recommend === "boolean" ? would_recommend : null,
      comments: sanitize(comments || "", MAX_TEXT_LENGTH),
      postcode_tested: sanitize(postcode_tested || "", MAX_POSTCODE_LENGTH),
      country: req.headers.get("CF-IPCountry") || null,
      source: "soft-launch",
    };

    const { error } = await supabase.from("feedback").insert(feedbackData);

    if (error) {
      console.error("Feedback insert error:", error);
      return NextResponse.json(
        { error: "Failed to save feedback" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Feedback API error:", err);
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}
