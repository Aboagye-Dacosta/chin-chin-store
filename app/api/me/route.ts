import { prisma } from "@/lib/prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get("email");

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
    include: {
      profile: true,
    },
  });

  return NextResponse.json(user, { status: 200 });
}

export async function POST(request: NextRequest) {
  const { userId, locationId, ...profile } = await request.json();
  console.log(userId, profile);

  if (!userId || !profile) {
    return NextResponse.json(
      { error: "Id and profile are required" },
      { status: 400 }
    );
  }

  let data = {
    ...profile,
    userId: userId,
  };

  if (locationId) {
    data = {
      ...data,
      locationId: locationId,
    };
  }

  const profileData = await prisma.profile.upsert({
    where: {
      userId: userId, 
    },
    create: data,
    update: data,

  });

  console.log(profileData);

  if (!profileData) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  return NextResponse.json({ profileData }, { status: 200 });
}
