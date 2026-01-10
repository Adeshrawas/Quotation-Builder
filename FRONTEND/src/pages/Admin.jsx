import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Pencil } from "lucide-react";

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserItems, setSelectedUserItems] = useState([]);
  const [selectedUserEmail, setSelectedUserEmail] = useState("");

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

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

  return (
    <div className="min-h-screen p-8 overflow-y-auto bg-gray-50">
      <div className="max-w-6xl p-6 mx-auto bg-white border border-gray-200 shadow-xl rounded-3xl">

        <h1 className="mb-8 text-4xl font-extrabold text-center text-indigo-700">
          Admin Panel
        </h1>

        <div className="flex flex-col gap-4 mb-8 md:flex-row md:items-center md:justify-between">
          <div className="flex gap-3">
            <Link
              to="/admin/add-user"
              className="px-4 py-2 text-white bg-blue-600 rounded-xl hover:bg-blue-700"
            >
              + Add User
            </Link>

            <Link
              to="/admin/messages"
              className="px-4 py-2 text-white bg-indigo-600 rounded-xl hover:bg-indigo-700"
            >
              Messages
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <p className="text-lg font-semibold">
              Total Users: <span className="text-indigo-600">{totalUsers}</span>
            </p>

            <input
              type="text"
              placeholder="Search by email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-56 px-4 py-2 border border-gray-300 shadow-sm rounded-xl"
            />
          </div>
        </div>

        {/* USERS TABLE */}
        <div className="mb-8 overflow-x-auto border border-gray-200 shadow-md rounded-2xl">
          <table className="w-full text-sm">
            <thead className="text-gray-800 bg-indigo-100">
              <tr className="text-center">
                <th className="p-4">Name</th>
                <th className="p-4">Phone No</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Edit</th>
                <th className="p-4">Delete</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((user, i) => (
                <tr
                  key={user._id}
                  className={`text-center cursor-pointer ${
                    i % 2 ? "bg-gray-50" : "bg-white"
                  } hover:bg-indigo-50`}
                >
                  <td className="p-4" onClick={() => handleUserClick(user._id, user.email)}>
                    {user.name || "N/A"}
                  </td>

                  <td className="p-4" onClick={() => handleUserClick(user._id, user.email)}>
                    {user.phoneNo || "N/A"}
                  </td>

                  <td className="p-4" onClick={() => handleUserClick(user._id, user.email)}>
                    {user.email}
                  </td>

                  <td className="p-4">{user.role}</td>

                  <td className="p-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/admin/edit/${user._id}`);
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Pencil size={20} />
                    </button>
                  </td>

                  <td className="p-4">
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
                            setUsers(users.filter((u) => u._id !== user._id));
                          });
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ITEMS PANEL */}
        {selectedUserItems.length > 0 && (
          <div className="p-4 border shadow-md rounded-2xl">
            <h2 className="mb-4 text-2xl font-semibold text-indigo-700">
              Items for: {selectedUserEmail}
            </h2>

            <table className="w-full text-sm">
              <thead className="bg-indigo-100">
                <tr>
                  <th className="p-4">Item Name</th>
                  <th className="p-4">Value</th>
                </tr>
              </thead>

              <tbody>
                {selectedUserItems.map((item, i) => (
                  <tr key={i} className={i % 2 ? "bg-gray-50" : "bg-white"}>
                    <td className="p-4">{item.itemName}</td>
                    <td className="p-4">₹{item.rate}</td>
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
