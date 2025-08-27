import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, MessageSquare, ShoppingBag } from "lucide-react";
import { useFormContext } from "react-hook-form";

export function UnauthOrderForms() {
  const { control } = useFormContext();
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5" />
          Delivery Information
        </CardTitle>
        <CardDescription>
          Provide your delivery information to complete your order
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <FormField
          control={control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Your Name *
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter your name"
                  {...field}
                  className="min-h-[44px]"
                />
              </FormControl>
              <FormDescription>Provide your name</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Your Email *
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter your email"
                  {...field}
                  className="min-h-[44px]"
                />
              </FormControl>
              <FormDescription>Provide your email</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="deliveryAddressLabel"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Delivery Address *
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter your complete delivery address"
                  {...field}
                  className="min-h-[44px]"
                />
              </FormControl>
              <FormDescription>
                Provide your complete address including landmarks
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="deliveryNote"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Delivery Instructions
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Special instructions for the delivery person (e.g., gate code, floor number, etc.)"
                  className="resize-none min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Optional: Any special instructions to help with delivery
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
