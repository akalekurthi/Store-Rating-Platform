import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/auth";
import RatingModal from "@/components/rating-modal";
import ChangePasswordModal from "@/components/change-password-modal";
import StarRating from "@/components/star-rating";
import { LogOut, Key, Search } from "lucide-react";

export default function UserDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchName, setSearchName] = useState("");
  const [searchAddress, setSearchAddress] = useState("");
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedStore, setSelectedStore] = useState<any>(null);

  const { data: stores, isLoading } = useQuery({
    queryKey: ["/api/stores"],
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

  const handleRateStore = (store: any) => {
    setSelectedStore(store);
    setShowRatingModal(true);
  };

  const handleSearch = () => {
    // In a real app, this would trigger a new query with search params
    // For now, we'll filter on the client side
  };

  const filteredStores = stores?.filter((store: any) => {
    const matchesName = !searchName || store.name.toLowerCase().includes(searchName.toLowerCase());
    const matchesAddress = !searchAddress || store.address.toLowerCase().includes(searchAddress.toLowerCase());
    return matchesName && matchesAddress;
  }) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Store Directory</h1>
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
        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <h2 className="text-lg font-semibold text-gray-900">Find Stores</h2>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                <Input
                  placeholder="Search by store name..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <Input
                  placeholder="Search by address..."
                  value={searchAddress}
                  onChange={(e) => setSearchAddress(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <Button onClick={handleSearch}>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Store Listings */}
        {isLoading ? (
          <div className="text-center py-8">Loading stores...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStores.map((store: any) => (
              <Card key={store.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{store.name}</h3>
                    <div className="flex items-center">
                      <StarRating rating={parseFloat(store.averageRating)} readOnly />
                      <span className="ml-2 text-sm text-gray-600">
                        {parseFloat(store.averageRating).toFixed(1)}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-4">{store.address}</p>

                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <span className="text-gray-500">Your Rating: </span>
                      {store.userRating ? (
                        <div className="flex items-center">
                          <span className="font-medium text-gray-900 mr-2">{store.userRating}</span>
                          <StarRating rating={store.userRating} readOnly size="sm" />
                        </div>
                      ) : (
                        <span className="font-medium text-gray-900">Not rated</span>
                      )}
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleRateStore(store)}
                    >
                      {store.userRating ? "Update Rating" : "Rate Store"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <RatingModal
        open={showRatingModal}
        onOpenChange={setShowRatingModal}
        store={selectedStore}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["/api/stores"] });
        }}
      />

      <ChangePasswordModal
        open={showPasswordModal}
        onOpenChange={setShowPasswordModal}
      />
    </div>
  );
}
