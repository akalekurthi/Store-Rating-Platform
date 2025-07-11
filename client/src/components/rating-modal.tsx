import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ratingSchema } from "@/lib/validation";
import StarRating from "./star-rating";

interface RatingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  store: any;
  onSuccess?: () => void;
}

type RatingFormData = {
  rating: number;
  review?: string;
};

export default function RatingModal({ open, onOpenChange, store, onSuccess }: RatingModalProps) {
  const { toast } = useToast();
  const [selectedRating, setSelectedRating] = useState(store?.userRating || 0);

  const form = useForm<RatingFormData>({
    resolver: zodResolver(ratingSchema.omit({ storeId: true })),
    defaultValues: {
      rating: store?.userRating || 0,
      review: "",
    },
  });

  const ratingMutation = useMutation({
    mutationFn: async (data: RatingFormData) => {
      const response = await apiRequest("POST", "/api/ratings", {
        ...data,
        storeId: store?.id,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Rating submitted successfully",
      });
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit rating",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RatingFormData) => {
    ratingMutation.mutate({
      ...data,
      rating: selectedRating,
    });
  };

  const handleRatingChange = (rating: number) => {
    setSelectedRating(rating);
    form.setValue("rating", rating);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Rate Store</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900">{store?.name}</h3>
            <p className="text-sm text-gray-600 mt-1">{store?.address}</p>
          </div>

          <div className="flex justify-center">
            <StarRating
              rating={selectedRating}
              onRatingChange={handleRatingChange}
              size="lg"
            />
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Current Rating: <span className="font-medium">{selectedRating}</span>
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="review"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Review (optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Leave a review..."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={ratingMutation.isPending || selectedRating === 0}
                >
                  {ratingMutation.isPending ? "Submitting..." : "Submit Rating"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
