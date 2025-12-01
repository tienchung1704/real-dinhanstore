"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { SignIn, SignUp } from "@clerk/nextjs";
import { X } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "sign-in" | "sign-up";
}

export function AuthModal({ isOpen, onClose, mode }: AuthModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const clerkAppearance = {
    elements: {
      rootBox: "mx-auto",
      card: "shadow-none border-0 bg-transparent",
      headerTitle: "text-2xl font-bold text-gray-900",
      headerSubtitle: "text-gray-600",
      socialButtonsBlockButton:
        "border border-gray-200 hover:bg-gray-50 transition-colors",
      formButtonPrimary:
        "bg-emerald-600 hover:bg-emerald-700 text-white font-medium",
      formFieldInput:
        "border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-lg",
      footerActionLink: "text-emerald-600 hover:text-emerald-700 font-medium",
      identityPreviewEditButton: "text-emerald-600 hover:text-emerald-700",
    },
    variables: {
      colorPrimary: "#059669",
      borderRadius: "0.75rem",
    },
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-md">
        {/* Modal Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-8 text-center relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-10 h-10 text-white"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <ellipse cx="12" cy="9" rx="5" ry="6" />
                <rect x="11" y="14" width="2" height="7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white">
              {mode === "sign-in" ? "Chào mừng trở lại!" : "Tạo tài khoản"}
            </h2>
            <p className="text-emerald-100 mt-1">
              {mode === "sign-in"
                ? "Đăng nhập để tiếp tục mua sắm"
                : "Đăng ký để nhận ưu đãi đặc biệt"}
            </p>
          </div>

          {/* Clerk Form */}
          <div className="p-6">
            {mode === "sign-in" ? (
              <SignIn appearance={clerkAppearance} routing="hash" />
            ) : (
              <SignUp appearance={clerkAppearance} routing="hash" />
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
