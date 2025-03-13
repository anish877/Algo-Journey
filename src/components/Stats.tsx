'use client'
import React, { useCallback, useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import toast from 'react-hot-toast';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import SearchInput from './SearchInput';
import Modal from './ui/Modal';
import Link from 'next/link';
import { Users, UserCheck, Award, Target, ChevronRight } from 'lucide-react';

interface User {
  id: string;
  username: string;
  email: string;
  section: string;
  group: {
    name: string
  };
  leetcodeUsername: string;
  codeforcesUsername: string;
  individualPoints: number;
  createdAt: Date;
  updatedAt: Date;
}

const StatsCard = ({ 
  title, 
  value, 
  description, 
  icon, 
  loading, 
  color 
}: { 
  title: string, 
  value: string, 
  description: string, 
  icon: React.ReactNode, 
  loading: boolean,
  color: string 
}) => (
  <Card className={`bg-white border-l-4 ${color} shadow-sm hover:shadow-md transition-all`}>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
        {icon}
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent>
      {loading ? (
        <Skeleton className="h-8 w-[100px]" />
      ) : (
        <>
          <div className="text-3xl font-bold text-gray-800">{value}</div>
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        </>
      )}
    </CardContent>
  </Card>
);

const UserData = ({ user }: {user: User | null}) => {
  return (
    <div className="py-4 px-1">
      {user ? (
        <div className="space-y-3">
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
            <h3 className="font-medium text-gray-800 mb-2">User Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm"><span className="font-medium text-gray-700">Name:</span> {user.username}</p>
                <p className="text-sm"><span className="font-medium text-gray-700">Email:</span> {user.email}</p>
                <p className="text-sm"><span className="font-medium text-gray-700">Section:</span> {user.section}</p>
                <p className="text-sm"><span className="font-medium text-gray-700">Group:</span> {user.group.name}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm"><span className="font-medium text-gray-700">Points:</span> {user.individualPoints}</p>
                <p className="text-sm"><span className="font-medium text-gray-700">Leetcode:</span> {user.leetcodeUsername || 'Not set'}</p>
                <p className="text-sm"><span className="font-medium text-gray-700">CodeForces:</span> {user.codeforcesUsername || 'Not set'}</p>
                <p className="text-sm"><span className="font-medium text-gray-700">Joined:</span> {new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-4 text-gray-500">No user details available</div>
      )}
    </div>
  );
};

const UserList = ({ loading, users }: { loading: boolean, users: User[] }) => {
  const [userDetails, setUserDetails] = useState<User | null>(null);
  
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  const handleViewDetails = async (id: string) => {
    try {
      const response = await axios.post('/api/getUserDetails', { id })
      if(!response.data.userDetail) return toast.error('User not found')  
      setUserDetails(response.data.userDetail)
      toast.success('Viewing user details')
    } catch (error) {
      console.log(error)
      toast.error('Some error occurred')
    }
  }

  return (
    <div className="space-y-4">
      {users && users.length > 0 ? users.map((u) => (
        <Card key={u.id} className="bg-white/90 shadow-sm hover:shadow-md transition-all border-gray-100">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                {u.username.charAt(0).toUpperCase()}
              </div>
              <div className="space-y-1">
                <Link href={`/user/updateProfile/${u.username}`} target='_blank'>
                  <h4 className="font-medium text-indigo-700 hover:text-indigo-800 transition-colors">{u.username}</h4>
                </Link>
                <p className="text-sm text-gray-600">Section {u.section}</p>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                    {u.individualPoints} points
                  </span>
                  <span className="text-sm text-gray-500">{u.email}</span>
                </div>
              </div>
            </div>
            <Modal
              trigger={
                <Button variant="outline" size="sm" className="border-gray-200 hover:bg-indigo-50 text-indigo-600">
                  View Details <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              }
              title="User Information"
            >
              <UserData user={userDetails}/>
            </Modal>
          </div>
        </Card>
      )) : (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-100 shadow-sm">
          <p className="text-gray-600">No users found</p>
        </div>
      )}
    </div>
  );
};

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>(users);
  const [numbers, setNumbers] = useState({
    totalUsers: 0,
    totalGroups: 0,
    activeContests: 0
  });
  const router = useRouter();

  const getNumbers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.post('/api/checkIfAdmin');
      if(!res.data.isAdmin) {
        toast.error('You are not authorized to access this page');
        router.push('/');
        return;
      }
      const response = await axios.post('/api/getNumbers');
      setNumbers({
        totalUsers: response.data.totalUsers,
        totalGroups: response.data.totalGroups,
        activeContests: response.data.totalContests
      });
      setUsers(response.data.usersArray);
      setFilteredUsers(response.data.usersArray);
    } catch (error) {
      console.log(error);
      toast.error('Some error occurred');
    } finally {
      setLoading(false);
    }
  }, [router, setUsers, setNumbers]);

  useEffect(() => {
    getNumbers();
  }, [getNumbers]);

  return (
    <div className="min-h-screen bg-gray-50"> 
      <div className="container mx-auto p-8 pt-20 space-y-8">
        {/* Welcome header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Admin <span className="text-indigo-600">Dashboard</span>
            </h1>
            <p className="text-gray-600 mt-1">Monitor platform activity and manage users</p>
          </div>
          <Button className='bg-indigo-600 text-white' onClick={() => router.push('/leaderboard/admin')} variant="outline" size="sm">Arena Leaderboard</Button>
        </div>
        
        {/* Stats cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <StatsCard
            title="Total Users"
            value={numbers.totalUsers.toString()}
            description="Active students"
            icon={<Users className="h-4 w-4 text-blue-500" />}
            loading={loading}
            color="border-l-blue-400"
          />
          <StatsCard
            title="Total Teams"
            value={numbers.totalGroups.toString()}
            description="Active groups"
            icon={<UserCheck className="h-4 w-4 text-amber-500" />}
            loading={loading}
            color="border-l-amber-400"
          />
          <StatsCard
            title="All Contests"
            value={numbers.activeContests.toString()}
            description="Platform contests"
            icon={<Award className="h-4 w-4 text-rose-500" />}
            loading={loading}
            color="border-l-rose-400"
          />
        </div>

        {/* Main Content Tabs */}
        <Card className="bg-white/90 shadow-sm border-gray-100">
          <CardHeader className="border-b border-gray-100 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Target className="h-5 w-5 text-indigo-500" />
                  Student Management
                </CardTitle>
                <CardDescription className="text-gray-500">
                  View and manage all registered students
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="mb-6">
              <SearchInput<User> items={users} onResultsChange={setFilteredUsers} />   
            </div>
            <ScrollArea className="h-[550px] pr-4">
              <UserList loading={loading} users={filteredUsers} />
            </ScrollArea>
          </CardContent>
          <CardFooter className="border-t border-gray-100 pt-4">
            <div className="text-sm text-gray-500">
              Showing {filteredUsers.length} of {users.length} users
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;