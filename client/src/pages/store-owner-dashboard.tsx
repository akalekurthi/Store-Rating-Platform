import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/auth";
import ChangePasswordModal from "@/components/change-password-modal";
import StarRating from "@/components/star-rating";
import { LogOut, Key } from "lucide-react";
import { format } from "date-fns";

export default function StoreOwnerDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const { data: stores, isLoading: storesLoading } = useQuery({
    queryKey: ["/api/stores/owner", user?.id],
    enabled: !!user,
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/";
        }, 500);
      }
    },
  });

  const { data: ratings, isLoading: ratingsLoading } = useQuery({
    queryKey: ["/api/ratings/store", stores?.[0]?.id],
    enabled: !!stores?.[0]?.id,
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/";
        }, 500);
      }
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout");
    },
    onSuccess: () => {
      window.location.href = "/";
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Logout failed",
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const store = stores?.[0]; // Assuming store owner has one store

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Store Owner Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{user?.name}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPasswordModal(true)}
              >
                <Key className="h-4 w-4 mr-2" />
                Change Password
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Store Info Card */}
        {storesLoading ? (
          <div className="text-center py-8">Loading store information...</div>
        ) : store ? (
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{store.name}</h2>
                  <p className="text-gray-600 mt-1">{store.address}</p>
                  <p className="text-sm text-gray-500 mt-1">{store.email}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center justify-end mb-2">
                    <StarRating rating={parseFloat(store.averageRating)} readOnly />
                    <span className="text-2xl font-bold text-gray-900 ml-2">
                      {parseFloat(store.averageRating).toFixed(1)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Average Rating ({store.totalRatings} reviews)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-gray-600">No store found. Contact admin to register your store.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* User Ratings */}
        <Card>
          <CardHeader>
            <CardTitle>User Ratings</CardTitle>
          </CardHeader>
          <CardContent>
            {ratingsLoading ? (
              <div className="text-center py-8">Loading ratings...</div>
            ) : ratings && ratings.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Review</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ratings.map((rating: any) => (
                    <TableRow key={rating.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900">{rating.user?.name}</div>
                          <div className="text-sm text-gray-500">{rating.user?.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <StarRating rating={rating.rating} readOnly />
                          <span className="ml-2 text-sm text-gray-900">{rating.rating}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {format(new Date(rating.createdAt), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell className="text-sm text-gray-900">
                        {rating.review || "No review"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">No ratings yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <ChangePasswordModal
        open={showPasswordModal}
        onOpenChange={setShowPasswordModal}
      />
    </div>
  );
}
