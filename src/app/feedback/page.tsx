"use client";

import { useState } from "react";

export default function FeedbackPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    overall_rating: 0,
    ease_of_use: 0,
    useful_features: "",
    missing_features: "",
    would_recommend: true,
    comments: "",
    postcode_tested: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        alert("Something went wrong. Please try again.");
      }
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
        <div className="max-w-md text-center">
          <div className="text-6xl mb-4">🏡✨</div>
          <h1 className="text-2xl font-bold text-green-800 mb-2">Thank you!</h1>
          <p className="text-gray-600">
            Your feedback is incredibly valuable. We&apos;re building Evolving Home
            to help homeowners like you make smarter energy decisions.
          </p>
          <a
            href="/"
            className="inline-block mt-6 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  const StarRating = ({
    value,
    onChange,
    label,
  }: {
    value: number;
    onChange: (v: number) => void;
    label: string;
  }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`text-2xl transition ${
              star <= value ? "text-yellow-400" : "text-gray-300"
            } hover:text-yellow-400`}
          >
            ★
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white p-4">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8 pt-8">
          <h1 className="text-3xl font-bold text-green-800">
            🏡 Evolving Home Feedback
          </h1>
          <p className="text-gray-600 mt-2">
            Help us build the best home energy tool. Takes 2 minutes.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-lg p-6 space-y-5"
        >
          {/* Name & Email */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name (optional)
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email (optional)
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="you@email.com"
              />
            </div>
          </div>

          {/* Postcode tested */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Which postcode did you try? (optional)
            </label>
            <input
              type="text"
              value={form.postcode_tested}
              onChange={(e) =>
                setForm({ ...form, postcode_tested: e.target.value })
              }
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="e.g. AL1 4QA"
            />
          </div>

          {/* Ratings */}
          <StarRating
            label="Overall experience (1-5)"
            value={form.overall_rating}
            onChange={(v) => setForm({ ...form, overall_rating: v })}
          />

          <StarRating
            label="Ease of use (1-5)"
            value={form.ease_of_use}
            onChange={(v) => setForm({ ...form, ease_of_use: v })}
          />

          {/* Features */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              What did you find most useful?
            </label>
            <textarea
              value={form.useful_features}
              onChange={(e) =>
                setForm({ ...form, useful_features: e.target.value })
              }
              className="w-full border rounded-lg px-3 py-2 text-sm"
              rows={2}
              placeholder="Energy score, savings estimate, grants info, solar potential..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              What&apos;s missing? What would you add?
            </label>
            <textarea
              value={form.missing_features}
              onChange={(e) =>
                setForm({ ...form, missing_features: e.target.value })
              }
              className="w-full border rounded-lg px-3 py-2 text-sm"
              rows={2}
              placeholder="More countries, better recommendations, contractor quotes..."
            />
          </div>

          {/* Would recommend */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Would you recommend this to a friend?
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="recommend"
                  checked={form.would_recommend === true}
                  onChange={() => setForm({ ...form, would_recommend: true })}
                />
                <span className="text-sm">Yes 👍</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="recommend"
                  checked={form.would_recommend === false}
                  onChange={() => setForm({ ...form, would_recommend: false })}
                />
                <span className="text-sm">Not yet 🤔</span>
              </label>
            </div>
          </div>

          {/* Free text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Any other thoughts?
            </label>
            <textarea
              value={form.comments}
              onChange={(e) => setForm({ ...form, comments: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              rows={3}
              placeholder="Bugs, ideas, first impressions... anything helps!"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition disabled:opacity-50"
          >
            {submitting ? "Sending..." : "Submit Feedback 🚀"}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-4">
          Built with ❤️ by the Evolving Home team
        </p>
      </div>
    </div>
  );
}
