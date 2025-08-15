import Link from "next/link";
import { Container } from "./ui/contaner";

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground py-12">
      <Container className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">ChipMart</h3>
            <p className="text-gray-400">
              Premium chips delivered to your workplace. Fresh, delicious, and
              convenient.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/" className="hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-white">
                  Products
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Categories</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link
                  href="/products?category=coconut"
                  className="hover:text-white"
                >
                  Coconut Chips
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=cinnamon"
                  className="hover:text-white"
                >
                  Cinnamon Chips
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=chocolate"
                  className="hover:text-white"
                >
                  Chocolate Chips
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contact Info</h4>
            <ul className="space-y-2 text-gray-400">
              <li>Email: support@chipmart.com</li>
              <li>Phone: (555) 123-4567</li>
              <li>Hours: Mon-Fri 9AM-6PM</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 ChipMart. All rights reserved.</p>
        </div>
      </Container>
    </footer>
  );
}
