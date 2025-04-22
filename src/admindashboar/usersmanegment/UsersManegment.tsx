import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getAllUsers, updateUserRole, deleteUserAndAssociatedData } from "@/services/usersService";
import { User } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Trash2, Save, MapPin } from "lucide-react";

const UsersManegment = () => {
  const { userDetails } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [roleChanges, setRoleChanges] = useState<{ [key: string]: string }>({});

  // Fetch users on mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersData = await getAllUsers();
        setUsers(usersData);
        setFilteredUsers(usersData);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch users.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Filter users based on search and role
  useEffect(() => {
    let filtered = users;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (user) =>
          user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Role filter
    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  }, [searchQuery, roleFilter, users]);

  // Handle role change
  const handleRoleChange = (uid: string, newRole: string) => {
    setRoleChanges((prev) => ({ ...prev, [uid]: newRole }));
  };

  // Save role change
  const saveRoleChange = async (uid: string) => {
    const newRole = roleChanges[uid];
    if (!newRole) return;

    try {
      await updateUserRole(uid, newRole);
      setUsers((prev) =>
        prev.map((user) =>
          user.uid === uid ? { ...user, role: newRole } : user
        )
      );
      setRoleChanges((prev) => {
        const updated = { ...prev };
        delete updated[uid];
        return updated;
      });
      toast({
        title: "Success",
        description: "User role updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user role.",
        variant: "destructive",
      });
    }
  };

  // Delete user and associated data
  const handleDeleteUser = async (uid: string) => {
    if (window.confirm("Are you sure you want to delete this user? This will also delete their authentication account and all associated data (e.g., orders).")) {
      try {
        await deleteUserAndAssociatedData(uid);
        setUsers((prev) => prev.filter((user) => user.uid !== uid));
        toast({
          title: "Success",
          description: "User and associated data deleted successfully.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete user and associated data.",
          variant: "destructive",
        });
      }
    }
  };

  // Prevent admins from modifying their own role or deleting themselves
  if (userDetails?.role !== "admin") {
    return <div>You do not have permission to access this page.</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">User Management</h1>

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Input
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="user">User</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Addresses</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.uid}>
                <TableCell>{user.name || "N/A"}</TableCell>
                <TableCell>{user.email || "N/A"}</TableCell>
                <TableCell>{user.phone || "N/A"}</TableCell>
                <TableCell>
                  {user.uid === userDetails.uid ? (
                    <span>{user.role}</span>
                  ) : (
                    <Select
                      value={roleChanges[user.uid] || user.role}
                      onValueChange={(value) => handleRoleChange(user.uid, value)}
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="user">User</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </TableCell>
                <TableCell>
                  {user.createdAt instanceof Date && !isNaN(user.createdAt.getTime())
                    ? user.createdAt.toLocaleString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                        timeZone: "Asia/Dhaka", // UTC+6 for Bangladesh
                      })
                    : "N/A"}
                </TableCell>
                <TableCell>
                  {user.addresses && user.addresses.length > 0 ? (
                    <ul className="space-y-1">
                      {user.addresses.map((address) => (
                        <li key={address.id} className="flex items-center">
                          <MapPin size={14} className="mr-1" />
                          <span>
                            {address.type}: {address.street}, {address.city}, {address.postalCode}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    "No addresses"
                  )}
                </TableCell>
                <TableCell className="flex gap-2">
                  {roleChanges[user.uid] && user.uid !== userDetails.uid && (
                    <Button
                      size="sm"
                      onClick={() => saveRoleChange(user.uid)}
                    >
                      <Save size={16} className="mr-1" />
                      Save
                    </Button>
                  )}
                  {user.uid !== userDetails.uid && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteUser(user.uid)}
                    >
                      <Trash2 size={16} className="mr-1" />
                      Delete
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default UsersManegment;