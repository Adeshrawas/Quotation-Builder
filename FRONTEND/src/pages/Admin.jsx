import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Trash2 } from "lucide-react";

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserItems, setSelectedUserItems] = useState([]);
  const [selectedUserEmail, setSelectedUserEmail] = useState("");

  const token = localStorage.getItem("token");

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const fetchTotalUsers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/users/count", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTotalUsers(res.data.totalUsers);
    } catch (err) {
      console.error("Error fetching total users:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchTotalUsers();
  }, []);

  const filteredUsers = users.filter((user) =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUserClick = async (userId, email) => {
    try {
      setSelectedUserEmail(email);

      // ⭐ Now backend returns only admin-owned rates
      const res = await axios.get(
        `http://localhost:5000/api/admin/user/${userId}/items`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSelectedUserItems(res.data || []);
    } catch (err) {
      console.error("Error fetching user items:", err);
      setSelectedUserItems([]);
    }
  };

  const getItemName = (item) => item.itemName || item.item || "Item";
  const getItemValue = (item) => item.rate || 0;

  return (
    <div
      className="min-h-screen p-8 overflow-y-auto text-gray-800 bg-gray-50"
      style={{ scrollbarWidth: "none" }}
    >
      <style>{`::-webkit-scrollbar { display: none; }`}</style>

      <div className="max-w-6xl p-6 mx-auto bg-white border border-gray-200 shadow-xl rounded-3xl">
        <h1 className="mb-8 text-4xl font-extrabold text-center text-indigo-700">
          Admin Panel
        </h1>

        {/* Header */}
        <div className="flex flex-col gap-4 mb-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/admin/add-user"
              className="px-4 py-2 font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700"
            >
              + Add User
            </Link>
          </div>

          <div className="flex items-center gap-4 md:ml-auto">
            <p className="text-lg font-semibold text-gray-700 whitespace-nowrap">
              Total Users: <span className="text-indigo-600">{totalUsers}</span>
            </p>

            <input
              type="text"
              placeholder="Search by email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-56 px-4 py-2 transition border border-gray-300 shadow-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* USERS TABLE */}
        <div className="mb-8 overflow-x-auto border border-gray-200 shadow-md rounded-2xl">
          <table className="w-full text-sm border-collapse">
            <thead className="text-gray-700 bg-indigo-100">
              <tr>
                <th className="p-4 text-left border-b border-gray-300">Name</th>
                <th className="p-4 text-left border-b border-gray-300">Phone No</th>
                <th className="p-4 text-left border-b border-gray-300">Email</th>
                <th className="p-4 text-left border-b border-gray-300">Role</th>
                <th className="p-4 text-left border-b border-gray-300">Password</th>
                <th className="p-4 text-left border-b border-gray-300">Delete</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((user, index) => (
                <tr
                  key={user._id}
                  className={`transition-colors duration-200 cursor-pointer ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } hover:bg-indigo-50`}
                  onClick={() => handleUserClick(user._id, user.email)}
                >
                  <td className="p-4 border-b border-gray-200">{user.name || "N/A"}</td>
                  <td className="p-4 border-b border-gray-200">{user.phoneNo || "N/A"}</td>
                  <td className="p-4 border-b border-gray-200">{user.email}</td>
                  <td className="p-4 border-b border-gray-200">{user.role}</td>
                  <td className="p-4 border-b border-gray-200">
                    {user.password ? "******" : ""}
                  </td>

                  {/* Dustbin delete button */}
                  <td className="p-4 border-b border-gray-200">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!window.confirm("Delete this user?")) return;

                        axios
                          .delete(
                            `http://localhost:5000/api/admin/delete-user/${user._id}`,
                            { headers: { Authorization: `Bearer ${token}` } }
                          )
                          .then(() => {
                            setUsers((prev) =>
                              prev.filter((u) => u._id !== user._id)
                            );
                          })
                          .catch(() => alert("Error deleting user"));
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={20} />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-6 italic text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* USER ITEMS TABLE */}
        {selectedUserItems.length > 0 && (
          <div className="p-4 overflow-x-auto border border-gray-200 shadow-md rounded-2xl">
            <h2 className="mb-4 text-2xl font-semibold text-indigo-700">
              Items for: {selectedUserEmail}
            </h2>

            <table className="w-full text-sm border-collapse">
              <thead className="text-gray-700 bg-indigo-100">
                <tr>
                  <th className="p-4 text-left border-b border-gray-300">Item Name</th>
                  <th className="p-4 text-left border-b border-gray-300">Value</th>
                </tr>
              </thead>

              <tbody>
                {selectedUserItems.map((item, index) => (
                  <tr
                    key={item._id || index}
                    className={`transition-colors duration-200 ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-indigo-50`}
                  >
                    <td className="p-4 border-b border-gray-200">{getItemName(item)}</td>
                    <td className="p-4 border-b border-gray-200">₹{getItemValue(item)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
