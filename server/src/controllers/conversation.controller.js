import { Conversation } from "../models/Conversation.js";

export const startConversation = async (req, res) => {
  const { user1_id, user2_id } = req.body;

  try {
    let conversation = await Conversation.findPrivateConversation(
      user1_id,
      user2_id
    );

    if (!conversation) {
      conversation = await Conversation.createPrivateConversation(
        user1_id,
        user2_id
      );
    }

    res.status(200).json({
      success: true,
      conversation_id: conversation.conversation_id,
    });
  } catch (error) {
    console.error("❌ Error starting chat:", error.message);
    return res.status(500).json({ success: false, message: "Failed to start chat" });
  }
};
export const fetchUserConversations = async (req, res) => {
  const { user_id } = req.params;
  try {
    const data = await Conversation.fetchUserConversations(user_id);
    res.status(200).json({
      success: true,
      message: "All conversation List",
      conversationsList: data,
    });
  } catch (error) {
    console.log("Error fetching user conversations: ", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
export const fetchFullPrivateConversation = async (req, res) => {
  const { conversation_id } = req.params;
  
  // Input validation

  try {
    const data = await Conversation.fetchFullPrivateConversation(
     conversation_id
    );
    
    // Handle case where conversation doesn't exist
    if (!data) {
      return res.status(404).json({
        success: true,
        message: "No conversation found between these users",
        conversation: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Fetched successfully",
      conversation: data,
    });
  } catch (error) {
    console.log(`Error fetching conversation between ${user1Id} and ${user2Id}:`, error.message);
    
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};