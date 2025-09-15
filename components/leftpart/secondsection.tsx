"use client";

import React from "react";
import {
  notify,
  help,
  pen,
  settings,
  chatHistory,
  littleDot,
} from "@/public/svgs/svgs";
import { baseInstance } from "@/constants/apis";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";

const quicklinks = [
  { icon: pen, name: "New Chat", url: "/chats/create-room" },
  // { icon: notify, name: 'Notifications'},
  // { icon: settings, name: 'Settings'},
  // { icon: help, name: 'Help & Support'},
];

type userNameProp = {
  name: string;
};

type chatRoomProp = {
  room_id: string;
  users: userNameProp[];
};

const Secondsection = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleFetch = async () => {
    const response = await baseInstance.get("/chats/my-rooms");
    return response.data;
  };

  const {
    data: chats,
    isLoading,
    error,
  } = useQuery<chatRoomProp[]>({
    queryKey: ["chat history"],
    queryFn: handleFetch,
    staleTime: 100 * 60 * 35,
    gcTime: 100 * 60 * 35,
  });

  const handleClick = async (url: string) => {
    // Post request to create/join the room
    const response = await baseInstance.post(url);
    const newRoom = response.data;

    // Optimistically update cache
    queryClient.setQueryData<chatRoomProp[]>(["chat history"], (oldRooms) => {
      if (!oldRooms) return [newRoom]; // if no rooms yet, create a new list
      return [...oldRooms, newRoom]; // append new room
    });

    // Optionally still refetch in background to stay in sync with backend
    queryClient.invalidateQueries({ queryKey: ["chat history"] });

    // Redirect to the new room
    router.push(`/dashboard/${newRoom.room_id}`);
  };

  const handleDelete = async (id: string) => {
    queryClient.setQueryData<chatRoomProp[]>(["chat history"], (oldRooms) => {
      if (!oldRooms) return [];
      return oldRooms.filter((room) => room.room_id !== id);
    });

    try {
      await baseInstance.delete(`/chats/room/${id}`);
      queryClient.invalidateQueries({ queryKey: ["chat history"] });
    } catch (error) {
      console.error("Delete failed", error);
      queryClient.invalidateQueries({ queryKey: ["chat history"] });
    }
  };

  return (
    <div>
      {quicklinks.map((links, idx) => (
        <div key={idx}>
          <button
            onClick={() => handleClick(links.url)}
            className="flex gap-2 text-[14px] pt-3 cursor-pointer"
          >
            {links.icon} {links.name}
          </button>
        </div>
      ))}

      <div className="mt-10">
        <hr className="mt-2 mb-2" />
        <p className="text-[12px] uppercase font-bold text-center flex gap-2">
          {chatHistory} chat history
        </p>
        {chats &&
          chats.map((chat: chatRoomProp) => (
            <div
              key={chat.room_id}
              className="h-full bg-[#1A1A1A] mt-2 rounded"
              style={{ fontFamily: '"Inter", sans-serif' }}
            >
              <Link
                href={`/dashboard/${chat.room_id}`}
                className=" flex gap-2 items-center p-2 ml-2 text-[12px] font-light"
              >
                {littleDot} Chat: <p className="truncate">{chat.room_id}</p>
              </Link>
            </div>
          ))}
      </div>
    </div>
  );
};

export default Secondsection;
