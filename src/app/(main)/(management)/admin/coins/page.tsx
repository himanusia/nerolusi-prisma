"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/app/_components/ui/card";
import { Button } from "~/app/_components/ui/button";
import { Input } from "~/app/_components/ui/input";
import { Badge } from "~/app/_components/ui/badge";
import Link from "next/link";
import { ArrowLeft, Coins, Plus, Minus, Search } from "lucide-react";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "~/app/_components/ui/dialog";

export default function CoinManagementPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [coinAmount, setCoinAmount] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: users, refetch } = api.admin.getUsersWithCoins.useQuery();
  const addCoinsMutation = api.admin.addCoins.useMutation();
  const removeCoinsMutation = api.admin.removeCoins.useMutation();

  const filteredUsers = users?.filter(user => 
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCoinOperation = async (operation: 'add' | 'remove') => {
    if (!selectedUser || !coinAmount) return;

    try {
      const amount = parseInt(coinAmount);
      if (operation === 'add') {
        await addCoinsMutation.mutateAsync({
          userId: selectedUser.id,
          amount
        });
        toast.success(`Added ${amount} coins to ${selectedUser.name}`);
      } else {
        await removeCoinsMutation.mutateAsync({
          userId: selectedUser.id,
          amount
        });
        toast.success(`Removed ${amount} coins from ${selectedUser.name}`);
      }
      
      await refetch();
      setIsDialogOpen(false);
      setCoinAmount("");
      setSelectedUser(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to update coins");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Coin Management</h1>
          <p className="text-gray-600">Manage user coin balances</p>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
        </CardContent>
      </Card>

      {/* Users List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers?.map((user) => (
          <Card key={user.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{user.name}</CardTitle>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
                <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'}>
                  {user.role}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Coins className="h-5 w-5 text-yellow-500" />
                  <span className="text-2xl font-bold">{user.coins || 0}</span>
                  <span className="text-gray-500">coins</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Dialog open={isDialogOpen && selectedUser?.id === user.id} onOpenChange={(open) => {
                  setIsDialogOpen(open);
                  if (!open) {
                    setSelectedUser(null);
                    setCoinAmount("");
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      className="flex-1 bg-green-500 hover:bg-green-600"
                      onClick={() => setSelectedUser(user)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Coins to {user.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Amount</label>
                        <Input
                          type="number"
                          placeholder="Enter coin amount"
                          value={coinAmount}
                          onChange={(e) => setCoinAmount(e.target.value)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        onClick={() => handleCoinOperation('add')}
                        disabled={!coinAmount || addCoinsMutation.isPending}
                      >
                        Add Coins
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                      onClick={() => setSelectedUser(user)}
                    >
                      <Minus className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Remove Coins from {user.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Amount</label>
                        <Input
                          type="number"
                          placeholder="Enter coin amount"
                          value={coinAmount}
                          onChange={(e) => setCoinAmount(e.target.value)}
                          max={user.coins || 0}
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          Current balance: {user.coins || 0} coins
                        </p>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        onClick={() => handleCoinOperation('remove')}
                        disabled={!coinAmount || removeCoinsMutation.isPending}
                        variant="destructive"
                      >
                        Remove Coins
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredUsers?.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">No users found matching your search.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
