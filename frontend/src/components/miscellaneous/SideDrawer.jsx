import {
  Avatar,
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Icon,
  Input,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Spinner,
  Text,
  Tooltip,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { MdOutlineLogout } from "react-icons/md";
import { CgProfile } from "react-icons/cg";
import { BellIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { useState } from "react";
import { ChatState } from "../../Context/ChatProvider";
import ProfileModal from "./ProfileModal";
import { useHistory } from "react-router-dom";
import axios from "axios";
import ChatLoading from "../ChatLoading";
import UserListItem from "../UserAvatar/UserListItem";
import { getSender } from "../../config/ChatLogics";

const SideDrawer = () => {
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);

  const {
    user,
    setSelectedChat,
    chats,
    setChats,
    notification,
    setNotification,
  } = ChatState();
  const history = useHistory();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    history.push("/");
  };

  const toast = useToast();

  const handleSearch = async () => {
    if (!search) {
      toast({
        title: "Please Enter something in search",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top-left",
      });
      return;
    }

    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get(`https://secure-chat-slient-production.up.railway.app/api/user?search=${search}`, config);
      setLoading(false);
      setSearchResult(data);
    } catch (error) {
      toast({
        title: "Error Occured",
        description: "Failed to Load the Search Results",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  const accessChat = async (userId) => {
    try {
      setLoadingChat(true);
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post(`https://secure-chat-slient-production.up.railway.app/api/chat`, { userId }, config);

      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);

      setSelectedChat(data);
      setLoadingChat(false);
      onClose();
    } catch (error) {
      toast({
        title: "Error fetching the chat",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  const handleOnClose = () => {
    setSearch("");
    setSearchResult([]);
    onClose();
  };

  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        backgroundColor={"white"}
        w="100%"
        p="5px 10px 5px 10px"
        borderWidth="4px">
        <Tooltip label="Search Users to chat" hasArrow placement="bottom-end">
          <Button variant="ghost" onClick={onOpen}>
            <i className="fas fa-search"></i>
            <Text
              display={{ base: "none", md: "flex" }}
              ml={1}
              fontWeight="semibold">
              Search User
            </Text>
          </Button>
        </Tooltip>

        <Text fontSize="2xl" fontFamily="Work sans" fontWeight="bold">
          Super Secure Chat App
        </Text>

        <div>
          <Menu>
            <MenuButton p={1}>
              <BellIcon
                fontSize="2xl"
                m={1}
                style={{
                  color:
                    !notification.length && "No New Messages"
                      ? "#000000"
                      : "#E76161",
                }}
              />
            </MenuButton>
            <MenuList pl={2}>
              {!notification.length && "No New Messages"}
              {notification.map((notif) => (
                <MenuItem
                  key={notif._id}
                  onClick={() => {
                    setSelectedChat(notif.chat);
                    setNotification(notification.filter((n) => n !== notif));
                  }}>
                  {notif.chat.isGroupChat
                    ? `New Message in ${notif.chat.chatName}`
                    : `New Message from ${getSender(user, notif.chat.users)}`}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
          <Menu>
            <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
              <Avatar
                size="sm"
                cursor="pointer"
                name={user.name}
                src={user.pic}
              />
            </MenuButton>
            <MenuList>
              <ProfileModal user={user}>
                <MenuItem
                  borderRadius="lg"
                  borderWidth="1px"
                  w="96%"
                  ml={1}
                  mb={2}
                  shadow="md">
                  <Avatar
                    size="sm"
                    cursor="pointer"
                    mr={2}
                    name={user.name}
                    src={user.pic}
                  />
                  <Text fontWeight="semibold">{user.name}</Text>
                </MenuItem>
              </ProfileModal>
              <ProfileModal user={user}>
                <MenuItem>
                  <Icon as={CgProfile} mr={2} boxSize={6} />
                  My Profile
                </MenuItem>
              </ProfileModal>
              <MenuDivider />
              <MenuItem onClick={logoutHandler}>
                <Icon as={MdOutlineLogout} mr={2} boxSize={6} />
                Logout
              </MenuItem>
            </MenuList>
          </Menu>
        </div>
      </Box>

      <Drawer placement="left" onClose={handleOnClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px">Search Users</DrawerHeader>
          <DrawerBody>
            <Box display="flex" pb={2}>
              <Input
                placeholder="Search by name or email"
                mr={2}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button onClick={handleSearch}>Go</Button>
            </Box>
            {loading ? (
              <ChatLoading />
            ) : (
              Array.isArray(searchResult) &&
              searchResult.map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => accessChat(user._id)}
                />
              ))
            )}
            {loadingChat && <Spinner ml="auto" display="flex" />}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};
export default SideDrawer;
