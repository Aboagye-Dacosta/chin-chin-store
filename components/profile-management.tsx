"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useForm } from "react-hook-form";
import { ProfileSchema, profileSchema } from "@/schema/profile-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Textarea } from "./ui/textarea";
import { Container } from "./ui/contaner";
import { toast } from "sonner";
import { useProfile } from "@/hooks/use-profile";
import { UploadButton } from "@/lib/uploadthing";
import { Flex } from "./ui/flex";
import { LoadingSpinner } from "./ui/loading-spinner";
import { useEffect, useTransition } from "react";
import deleteProfileImage from "@/actions/delete-profile-image";
import { useUserStore } from "@/store/user-store";
import { useRouter } from "next/navigation";

export default function ProfileManagement() {
  const { updateProfile, isLoading } = useProfile();
  const [, startTransition] = useTransition();
  const { user } = useUserStore();
  const router = useRouter();

  const form = useForm<ProfileSchema>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      phoneNumber: user?.profile?.phoneNumber ?? "",
      address: user?.profile?.address ?? "",
      bio: user?.profile?.bio ?? "",
      imageUrl: JSON.stringify(user?.profile?.imageUrl),
      userId: user?.id ?? "",
    },
  });

  const onSubmit = (data: ProfileSchema) => {
    updateProfile(data);
  };

  const deleteImage = async () => {
    if (!user?.profile?.imageUrl?.key) return;
    startTransition(() => {
      deleteProfileImage(user?.profile?.imageUrl?.key ?? "");
    });
  };

  useEffect(() => {
    if (user) {
      form.reset({
        phoneNumber: user?.profile?.phoneNumber ?? "",
        address: user?.profile?.address ?? "",
        bio: user?.profile?.bio ?? "",
        imageUrl: JSON.stringify(user?.profile?.imageUrl),
        userId: user?.id ?? "",
      });
    }
  }, [user, router]);

  return (
    <Container>
      <Card className="w-full shadow-none border-none py-[24px] md:py-[32px] lg:py-[64px]">
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
          <CardDescription>
            Update your personal information and preferences.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row justify-start items-start gap-8 w-full">
          <div className="flex items-start gap-4 justify-start">
            <Avatar className="h-20 w-20">
              <AvatarImage
                src={user?.profile?.imageUrl?.ufsUrl ?? ""}
                alt={`${user?.name}'s avatar`}
              />
              <AvatarFallback>
                {isLoading ? (
                  <div className="w-12 h-12">
                    <LoadingSpinner />
                  </div>
                ) : (
                  user?.name?.charAt(0)?.toUpperCase()
                )}
              </AvatarFallback>
            </Avatar>
            <Flex direction="col" gap="md">
              <div className="grid gap-1">
                <div className="font-semibold text-lg whitespace-nowrap">
                  {user?.name}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {user?.email}
                </div>
              </div>
              <div className="flex items-center gap-4 justify-start">
                <UploadButton
                  endpoint="imageUploader"
                  onClientUploadComplete={(res) => {
                    updateProfile(
                      {
                        ...form.getValues(),
                        imageUrl: JSON.stringify(res?.[0]),
                      },
                      {
                        onSuccess: () => {
                          deleteImage();
                        },
                      }
                    );
                    toast.success("Upload Completed");
                  }}
                  onUploadError={(error: Error) => {
                    toast.error(`Upload Failed! ${error.message}`);
                  }}
                  appearance={{
                    button: {
                      backgroundColor: "var(--primary)",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      padding: "0 8px",
                      fontSize: "var(--font-size-sm)",
                      fontWeight: "var(--font-weight)",
                      cursor: "pointer",
                      transition: "all 0.2s ease-in-out",
                      whiteSpace: "nowrap",
                    },
                  }}
                  content={{
                    button({ ready, isUploading }) {
                      if (isUploading)
                        return (
                          <Flex direction="row" gap="sm">
                            <LoadingSpinner className="!w-5 !h-5" />{" "}
                            Uploading...
                          </Flex>
                        );
                      if (!ready) return "Upload Profile";
                      return "Upload Profile";
                    },
                  }}
                />
              </div>
            </Flex>
          </div>

          <Card className="p-[24px] rounded-none border-none w-full">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-[24px]"
              >
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., +1234567890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., 123 Main St, Anytown, USA"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., 123 Main St, Anytown, USA"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="ml-auto" size="lg">
                  Save Profile
                </Button>
              </form>
            </Form>
          </Card>
        </CardContent>
      </Card>
    </Container>
  );
}
