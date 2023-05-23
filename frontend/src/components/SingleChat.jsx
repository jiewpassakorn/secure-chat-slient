/* eslint-disable react-hooks/exhaustive-deps */
import {
  Box,
  FormControl,
  IconButton,
  Input,
  Spinner,
  Text,
  useToast,
} from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { ChatState } from "../Context/ChatProvider";
import { getSender, getSenderFull } from "../config/ChatLogics";
import ProfileModal from "./miscellaneous/ProfileModal";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
import { useEffect, useState } from "react";
import axios from "axios";
import "./SingleChat.css";
import ScrollableChat from "./ScrollableChat";
import { io } from "socket.io-client";
import CryptoJS from "crypto-js";

const ENDPOINT = "https://secure-chat-slient-production.up.railway.app";
let socket;
let selectedChatCompare;
const PATH=import.meta.env.PATH
const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const toast = useToast();

  const { user, selectedChat, setSelectedChat, notification, setNotification } =
    ChatState();

  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      setLoading(true);
      
      const { data } = await axios.get(
        `https://secure-chat-slient-production.up.railway.app/api/message/${selectedChat._id}`,
        config
      );

      // Decrypt the messages
      const decryptedMessages = data.map((message) => {
        const decryptedContent = CryptoJS.AES.decrypt(
          message.content,
          import.meta.env.VITE_SECRET_KEY
        ).toString(CryptoJS.enc.Utf8);

        return {
          ...message,
          content: decryptedContent,
        };
      });

      setMessages(decryptedMessages);
      setLoading(false);
      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      toast({
        title: "Error Occurred!",
        description: "Failed to load the Message",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  useEffect(() => {
    fetchMessages();

    selectedChatCompare = selectedChat;
  }, [selectedChat]);

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));

    return () => {
      // Clean up the socket event listeners
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const handleMessageReceived = (newMessageReceived) => {
      if (
        !selectedChatCompare ||
        selectedChatCompare._id !== newMessageReceived.chat._id
      ) {
        // give notification
        if (!notification.includes(newMessageReceived)) {
          setNotification([newMessageReceived, ...notification]);
          setFetchAgain(!fetchAgain);
        }
      } else {
        // Decrypt the message
        const decryptedMessage = CryptoJS.AES.decrypt(
          newMessageReceived.content,
          import.meta.env.VITE_SECRET_KEY
        ).toString(CryptoJS.enc.Utf8);

        setMessages((messages) => [
          ...messages,
          {
            ...newMessageReceived,
            content: decryptedMessage,
          },
        ]);
      }
    };

    socket.on("message received", handleMessageReceived);

    return () => {
      // Clean up the socket event listener
      socket.off("message received", handleMessageReceived);
    };
  }, [notification, fetchAgain]);

  const sendMessage = async (event) => {
    if (event.key === "Enter" && newMessage) {
      socket.emit("stop typing", selectedChat._id);
      try {
        const config = {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };

        // Encrypt the message using AES
        const encryptedMessage = CryptoJS.AES.encrypt(
          newMessage,
          import.meta.env.VITE_SECRET_KEY
        ).toString();

        setNewMessage("");
        const { data } = await axios.post(
          "https://secure-chat-slient-production.up.railway.app/api/message",
          {
            content: encryptedMessage,
            chatId: selectedChat._id,
          },
          config
        );

        // Decrypt the received message
        const decryptedMessage = CryptoJS.AES.decrypt(
          data.content,
          import.meta.env.VITE_SECRET_KEY
        ).toString(CryptoJS.enc.Utf8);
        socket.emit("new message", data);
        data.content = decryptedMessage; // Update the message content to decrypted value
        setNewMessage("");

        setMessages([...messages, data]);
        setFetchAgain(!fetchAgain);
      } catch (error) {
        toast({
          title: "Error Occurred!",
          description: "Failed to send the Message",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
    }
  };

  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    // Typing Indicator Logic
    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }
    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  return (
    <>
      {selectedChat ? (
        <>
          <Text
            fontSize={{ base: "28px", md: "30px" }}
            pb={3}
            px={2}
            w="100%"
            fontFamily="Work sans"
            display="flex"
            justifyContent={{ base: "space-between" }}
            alignItems="center"
          >
            <IconButton
              display={{ base: "flex", md: "none" }}
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat("")}
            />
            {!selectedChat.isGroupChat ? (
              <>
                {getSender(user, selectedChat.users)}
                <ProfileModal
                  user={getSenderFull(user, selectedChat.users)}
                />
              </>
            ) : (
              <>
                {selectedChat.chatName.toUpperCase()}
                <UpdateGroupChatModal
                  fetchAgain={fetchAgain}
                  setFetchAgain={setFetchAgain}
                  fetchMessages={fetchMessages}
                />
              </>
            )}
          </Text>

          <Box
            display="flex"
            flexDir="column"
            justifyContent="flex-end"
            p={3}
            bg="#E8E8E8"
            w="100%"
            h="100%"
            borderRadius="lg"
            overflowY="hidden"
          >
            {loading ? (
              <Spinner size="xl" w={20} h={20} alignSelf="center" margin="auto" />
            ) : (
              <div className="messages">
                {/* Messages */}
                <ScrollableChat messages={messages} />
              </div>
            )}

            <FormControl onKeyDown={sendMessage} isRequired mt={3}>
              {isTyping ? <div style={{ color: "grey" }}>Typing...</div> : <></>}
              <Input
                variant="filled"
                bg="#E0E0E0"
                placeholder="Enter a message.."
                autoComplete="off"
                onChange={typingHandler}
                value={newMessage}
              />
            </FormControl>
          </Box>
        </>
      ) : (
        <Box display="flex" alignItems="center" justifyContent="center" h="100%">
          <Text fontSize="3xl" pb={3} fontFamily="Work sans">
            Click on a user to start chatting
          </Text>
        </Box>
      )}
    </>
  );
};

export default SingleChat;
