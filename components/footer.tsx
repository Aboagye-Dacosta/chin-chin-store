import Link from "next/link";
import { Container } from "./ui/contaner";
import { IconLogo } from "./ui/icon-logo";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

export async function Footer() {
  const support = await fetchQuery(api.support.getSupport);
  return (
    <footer className="bg-primary text-primary-foreground py-12">
      <Container className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4 text-[#fff]">
              <IconLogo />
            </h3>
            <p className="text-gray-300">
              Premium chips delivered to your workplace. Fresh, delicious, and
              convenient.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-[#fff]">Quick Links</h4>
            <ul className="space-y-2 text-gray-300">
              <li>
                <Link href="/" className="hover:text-[#fff]">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-[#fff]">
                  Products
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-[#fff]">Categories</h4>
            <ul className="space-y-2 text-gray-300">
              <li>
                <Link
                  href="/products?category=coconut"
                  className="hover:text-[#fff]"
                >
                  Coconut Chips
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=cinnamon"
                  className="hover:text-[#fff]"
                >
                  Cinnamon Chips
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=chocolate"
                  className="hover:text-[#fff]"
                >
                  Chocolate Chips
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-[#fff]">Contact Info</h4>
            <ul className="space-y-2 text-gray-300">
              <li>Email: {support?.email}</li>
              <li>Phone: {support?.phone}</li>
              <li>Hours: {support?.operationHours}</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-300">
          <p>&copy; 2025 ChipChin. All rights reserved.</p>
        </div>
      </Container>
    </footer>
  );
}
