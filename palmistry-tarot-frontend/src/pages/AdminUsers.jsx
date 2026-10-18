import { useState, useEffect } from "react";
import Card from "../components/ui/Card";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const usersList = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.role?.toLowerCase() !== 'admin' && data.role !== 'Administrator') {
            usersList.push({ id: doc.id, ...data });
          }
        });
        setUsers(usersList.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)));
      } catch (err) {
        console.error("Failed to fetch users", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const groupedUsers = users.reduce((acc, user) => {
    const role = user.role || 'user';
    if (!acc[role]) acc[role] = [];
    acc[role].push(user);
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl mb-1">Users</h1>
        <p className="text-inkMuted text-sm">Manage all platform users grouped by their roles.</p>
      </div>

      {loading ? (
        <Card>
          <p className="text-inkMuted text-sm text-center py-4">Loading users...</p>
        </Card>
      ) : (
        Object.entries(groupedUsers).map(([role, roleUsers]) => (
          <Card key={role} className="flex flex-col gap-4">
            <h2 className="text-xl capitalize text-gold border-b border-line pb-2">
              {role === 'user' ? 'Standard Users' : role} ({roleUsers.length})
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-inkMuted border-b border-line">
                    <th className="pb-2 font-normal">Name</th>
                    <th className="pb-2 font-normal">Email</th>
                    <th className="pb-2 font-normal">Joined</th>
                    <th className="pb-2 font-normal">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {roleUsers.map((u) => (
                    <tr key={u.id} className="border-b border-line last:border-0 hover:bg-white/5 transition-colors">
                      <td className="py-3">{u.name}</td>
                      <td className="py-3">{u.email}</td>
                      <td className="py-3">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Unknown'}</td>
                      <td className="py-3 flex gap-3">
                        <button className="text-violet hover:underline">View</button>
                        <button className="text-red-500 hover:underline">Deactivate</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ))
      )}
      
      {!loading && users.length === 0 && (
        <Card>
          <p className="text-center text-inkMuted py-4">No users found.</p>
        </Card>
      )}
    </div>
  );
}