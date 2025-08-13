import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Container } from "./ui/contaner";
import BallpitChips from "./backgrounds/Ballpit/Ballpit";
import { Suspense } from "react";
import TextPressure from "./backgrounds/TextPressure/TextPressure";
import { ArrowDown } from "lucide-react";
import Image from "next/image";

export function Hero() {
  return (
    <section className="relative bg-gradient-to-r bg-[#8B4513]  text-white  h-screen overflow-hidden z-2 flex items-center justify-center">
      <div className="h-screen relative z-3 flex items-center justify-center">
        <div className="absolute -bottom-2/4 left-0 w-full h-full -z-1">
          <Image
            src="/hero-image.png"
            alt="Hero"
            fill
            className="object-contain"
          />
        </div>
        <Container className="container mx-auto px-4  z-3">
          <div className="max-w-3xl mx-auto">
            <div style={{ position: "relative" }} className="flex-none">
              <TextPressure
                text="ChinChin"
                flex={true}
                alpha={false}
                stroke={false}
                width={true}
                weight={true}
                italic={true}
                textColor="#ffffff"
                strokeColor="#ff0000"
                minFontSize={36}
              />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-center">
              What&apos;s there not like about it.
            </h1>

            <div className="flex gap-4 items-center justify-center">
              <Button
                size="lg"
                asChild
                className="bg-[#8c4913] hover:bg-[#8B4513] shadow-lg h-[50px] w-[50px] animate-bounce rounded-full"
              >
                <Link href="#products">
                  <ArrowDown className="w-6 h-6" />
                </Link>
              </Button>
            </div>
          </div>
        </Container>
      </div>
      <Suspense fallback={null}>
        <BallpitChips
          count={220}
          gravity={0.75}
          friction={0.997}
          wallBounce={0.9}
          maxVelocity={0.22}
          followCursor={true}
          className="absolute top-0 left-0 w-full h-1/2 -z-1"
        />
      </Suspense>
    </section>
  );
}
