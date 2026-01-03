/**
 * Users Page
 *
 * Performance-optimized users management page demonstrating:
 * - Virtualized tables for large datasets
 * - Debounced search with React Query integration
 * - Memoized components and callbacks
 * - Lazy loading patterns
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SmartTable, type ColumnDef } from "@/components/table";
import { ActionMenu } from "@/components/table";
import { StatCard } from "@/components/dashboard/StatCard";
import { Users as UsersIcon, UserPlus, Shield, UserCheck } from "lucide-react";
import { memo, useCallback, useMemo, useState } from "react";
import { useDebouncedSearch } from "@/hooks/use-debounce";
import { useUsers } from "@/hooks/use-users";

// Mock data - replace with real API when backend is ready
const mockUsers = Array.from({ length: 1000 }, (_, i) => ({
  id: i + 1,
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`,
  role: ['Admin', 'Manager', 'Operator', 'Viewer'][Math.floor(Math.random() * 4)],
  status: Math.random() > 0.1 ? 'Active' : 'Inactive',
  lastLogin: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
  department: ['Operations', 'Inventory', 'Sales', 'Admin'][Math.floor(Math.random() * 4)],
}));

type User = typeof mockUsers[0];

/**
 * User Actions Menu
 * Memoized component for user-specific actions
 */
const UserActions = memo(({ user }: { user: User }) => {
  const handleEdit = useCallback(() => {
    console.log('Edit user:', user.id);
    // TODO: Open edit modal
  }, [user.id]);

  const handleDelete = useCallback(() => {
    console.log('Delete user:', user.id);
    // TODO: Open delete confirmation modal
  }, [user.id]);

  const handleViewProfile = useCallback(() => {
    console.log('View profile:', user.id);
    // TODO: Navigate to user profile
  }, [user.id]);

  return (
    <ActionMenu>
      <Button variant="ghost" size="sm" onClick={handleViewProfile}>
        View Profile
      </Button>
      <Button variant="ghost" size="sm" onClick={handleEdit}>
        Edit User
      </Button>
      <Button variant="ghost" size="sm" onClick={handleDelete} className="text-destructive hover:text-destructive">
        Delete User
      </Button>
    </ActionMenu>
  );
});

/**
 * User Status Badge
 * Memoized component for consistent status display
 */
const UserStatusBadge = memo(({ status }: { status: string }) => {
  const variant = status === 'Active' ? 'default' : 'secondary';
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
      status === 'Active'
        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
        : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }`}>
      {status}
    </span>
  );
});

/**
 * Users Page Component
 * Demonstrates performance optimizations for large datasets
 */
const Users = memo(() => {
  // Debounced search with React Query integration
  const { searchValue, debouncedSearchValue, setSearchValue } = useDebouncedSearch();

  // React Query hook (currently using mock data)
  const { data: usersData, isLoading } = useUsers();

  // Use mock data for now, replace with real data when backend is ready
  const allUsers = usersData?.data || mockUsers;

  // Memoized filtering based on debounced search
  const filteredUsers = useMemo(() => {
    if (!debouncedSearchValue) return allUsers;

    const searchLower = debouncedSearchValue.toLowerCase();
    return allUsers.filter(user =>
      user.name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.role.toLowerCase().includes(searchLower) ||
      user.department.toLowerCase().includes(searchLower)
    );
  }, [allUsers, debouncedSearchValue]);

  // Memoized table columns with optimized renderers
  const columns = useMemo<ColumnDef<User>[]>(() => [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      width: 200,
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
      width: 250,
    },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      width: 120,
      render: (user) => (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          <Shield className="h-3 w-3" />
          {user.role}
        </span>
      ),
    },
    {
      key: 'department',
      label: 'Department',
      sortable: true,
      width: 150,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      width: 100,
      render: (user) => <UserStatusBadge status={user.status} />,
    },
    {
      key: 'lastLogin',
      label: 'Last Login',
      sortable: true,
      width: 150,
      render: (user) => new Date(user.lastLogin).toLocaleDateString(),
    },
  ], []);

  // Memoized statistics
  const stats = useMemo(() => {
    const totalUsers = allUsers.length;
    const activeUsers = allUsers.filter(u => u.status === 'Active').length;
    const adminUsers = allUsers.filter(u => u.role === 'Admin').length;

    return {
      totalUsers,
      activeUsers,
      adminUsers,
      inactiveUsers: totalUsers - activeUsers,
    };
  }, [allUsers]);

  // Optimized action handlers
  const handleAddUser = useCallback(() => {
    console.log('Add new user');
    // TODO: Open add user modal
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UsersIcon className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Users</h1>
        </div>
        <Button onClick={handleAddUser}>
          <UserPlus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Users"
          value={stats.totalUsers}
          contentType="users"
          variant="primary"
        />
        <StatCard
          label="Active Users"
          value={stats.activeUsers}
          contentType="active"
          variant="success"
        />
        <StatCard
          label="Administrators"
          value={stats.adminUsers}
          contentType="shield"
          variant="warning"
        />
        <StatCard
          label="Inactive Users"
          value={stats.inactiveUsers}
          contentType="clock"
          variant="destructive"
        />
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            Manage system users and their permissions. Table automatically uses virtualization for large datasets.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SmartTable
            data={filteredUsers}
            columns={columns}
            actions={(user) => <UserActions user={user} />}
            searchable={true}
            searchPlaceholder="Search users by name, email, role, or department..."
            externalSearch={searchValue}
            onSearchChange={setSearchValue}
            isLoading={isLoading}
            emptyMessage="No users found"
            // Performance settings
            virtualizationThreshold={100} // Switch to virtualization at 100+ users
            rowHeight={60} // Slightly taller rows for user data
            containerHeight={600}
          />
        </CardContent>
      </Card>

      {/* Performance Info */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground space-y-2">
            <h4 className="font-medium text-foreground">Performance Features:</h4>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Debounced search prevents excessive API calls (300ms delay)</li>
              <li>Virtual scrolling for datasets with 100+ items</li>
              <li>Memoized components and data processing</li>
              <li>React Query caching and optimistic updates</li>
              <li>Lazy loading with code splitting</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

export default Users;
