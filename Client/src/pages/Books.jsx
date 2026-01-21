import React, { useState } from "react";
import DashboardHeader from "../components/DashboardHeader";
import Sidebar from "../components/SideBar";
import { useAuthStore } from "../store/authStore";
import BookListings from "../components/BookListings";
import { useNavigate } from "react-router-dom";

const Books = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const navigate = useNavigate()
  const onAddBook = ()=>{
    navigate("/sell-books")
  }
  const { user } = useAuthStore();
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        currentUser={user}
      />

      {/* Main Content */}
      <div className={`flex-1 flex flex-col overflow-hidden `}>
        <DashboardHeader />
        <main className="flex-1 w-full overflow-y-auto ">
          <BookListings onAddBook={()=>{
            onAddBook()
          }}/>
        </main>
      </div>
    </div>
  );
};

export default Books;
