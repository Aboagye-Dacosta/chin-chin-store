import { prisma } from "@/lib/prisma/client";
import bcrypt from "bcryptjs";
import { signIn } from "next-auth/react";
import { NextResponse } from "next/server";

export async function POST(request: Request): Promise<Response> {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify password
    const isValid = bcrypt.compareSync(password, existingUser.password!);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // Sign in the user
    const session = await signIn("Credentials", {
      email,
      password,
    });

    return NextResponse.json({ message: "User signed in successfully", session }, { status: 200 });
  } catch (error) {
    console.error("Error signing in:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}