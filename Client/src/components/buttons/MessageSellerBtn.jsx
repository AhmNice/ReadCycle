import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore"; // your existing store
import { MessageCircle } from "lucide-react";

const MessageSellerButton = ({ sellerId }) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const handleMessageSeller = async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/chats/start`,
        {
          user1_id: user.user_id,
          user2_id: sellerId,
        },
        { withCredentials: true }
      );

      if (res.data.success) {
        const conversationId = res.data.conversation_id;
        navigate(`/chat/${conversationId}`);
      }
    } catch (error) {
      console.error("❌ Failed to start chat:", error);
      alert("Could not start chat");
    }
  };

  return (
    <button
      onClick={handleMessageSeller}
      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-200 transform  shadow-lg hover:shadow-xl flex items-center cursor-pointer justify-center space-x-2 group/btn"
    >
      <MessageCircle className="h-3 w-3 group-hover/btn:scale-110 transition-transform duration-200" />
      <span className="text-sm">Message Seller</span>
    </button>
  );
};

export default MessageSellerButton;
