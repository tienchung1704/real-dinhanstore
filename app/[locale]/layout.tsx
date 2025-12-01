import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { NavigationMenuDemo } from "@/app/components/navigation-menu/navigation-menu";
import { UserSync } from "@/app/components/auth/UserSync";
import { ProductStoreProvider } from "@/app/hooks/useProductStore";
import { CartProvider } from "@/app/hooks/useCartStore";
import { CartModal } from "@/app/components/cart/CartModal";
import { ChatBot } from "@/app/components/chat/ChatBot";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ProductStoreProvider>
        <CartProvider>
          <UserSync />
          <div className="min-h-screen w-screen bg-gradient-to-br from-green-50 via-slate-50 to-pink-50 overflow-auto">
            <div className="flex items-center justify-center py-2 border-b">
              <NavigationMenuDemo />
            </div>
            <main className="w-full pt-20 px-4 sm:px-6 lg:px-8">{children}</main>
          </div>
          <CartModal />
          <ChatBot />
        </CartProvider>
      </ProductStoreProvider>
    </NextIntlClientProvider>
  );
}