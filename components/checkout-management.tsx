"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Container } from "@/components/ui/contaner";
import { useCart } from "@/hooks/use-cart";
import { Vendors } from "@/lib/fetch/fetch-vendors";
import { useUserStore } from "@/store/user-store";


export default function CheckoutPage({vendors,deliveryFee}: Readonly<{vendors:Vendors,deliveryFee:number}>) {
  const router = useRouter();
  const { items, getTotalPrice } = useCart();
  const { user } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    vendorId: "",
    paymentMethod: "pay_on_delivery",
    mobileNumber: "",
    deliveryAddress: "",
    notes: "",
  });

  useEffect(() => {
    if (!user) {
      router.push("/auth/signin");
      return;
    }

    if (items.length === 0) {
      router.push("/cart");  
    }

  }, [user, items, router]);

 
  const handleSubmit =  () => {
   
    
  };

  if (!user || items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Container className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Select Vendor Location</CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  value={formData.vendorId}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, vendorId: value }))
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose your preferred vendor location" />
                  </SelectTrigger>
                  <SelectContent>
                    {vendors.map((vendor) => (
                      <SelectItem key={vendor.id} value={vendor.id}>
                        {vendor.name}   
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={formData.paymentMethod}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, paymentMethod: value }))
                  }
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="pay_on_delivery"
                      id="pay_on_delivery"
                    />
                    <Label htmlFor="pay_on_delivery">Pay on Delivery</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="pay_before_delivery"
                      id="pay_before_delivery"
                    />
                    <Label htmlFor="pay_before_delivery">
                      Pay Before Delivery (Mobile Money)
                    </Label>
                  </div>
                </RadioGroup>

                {formData.paymentMethod === "pay_before_delivery" && (
                  <div className="mt-4">
                    <Label htmlFor="mobileNumber">Mobile Money Number</Label>
                    <Input
                      id="mobileNumber"
                      type="tel"
                      placeholder="Enter your mobile money number"
                      value={formData.mobileNumber}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          mobileNumber: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Delivery Information */}
            <Card>
              <CardHeader>
                <CardTitle>Delivery Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="deliveryAddress">Delivery Address</Label>
                  <Textarea
                    id="deliveryAddress"
                    placeholder="Enter your delivery address"
                    value={formData.deliveryAddress}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        deliveryAddress: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Special Instructions (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any special delivery instructions"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        notes: e.target.value,
                      }))
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map(({product, quantity}) => (
                  <div key={product.id} className="flex justify-between text-sm">
                    <span>
                      {product.title} x{quantity}
                    </span>
                    <span>${(product.price * quantity).toFixed(2)}</span>
                  </div>
                ))}

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${getTotalPrice().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span>$2.00</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>${(getTotalPrice() + 2).toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading || !formData.vendorId}
                >
                  {loading ? "Processing..." : "Place Order"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </form>
      </Container>
    </div>
  );
}
