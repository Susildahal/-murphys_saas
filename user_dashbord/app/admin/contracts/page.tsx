'use client'

import React, { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { createNotice } from "@/lib/redux/slices/noticSlicer"
import { useAppDispatch } from '@/lib/redux/hooks';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, Paperclip, Smile, MoreVertical, Phone, Video, Search } from 'lucide-react'
import { Card } from "@/components/ui/card"

interface Message {
    id: number;
    text: string;
    sender: 'user' | 'client';
    timestamp: string;
    name?: string;
    email?: string;
    phone?: string;
    title?: string;
}

const Page = () => {
    const dispatch = useAppDispatch();
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            text: "Hello! I'd like to discuss the contract details.",
            sender: 'client',
            timestamp: new Date(Date.now() - 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
        {
            id: 2,
            text: "Sure! I'll send you the contract notice right away.",
            sender: 'user',
            timestamp: new Date(Date.now() - 3000000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
    ]);

    const handleSendMessage = () => {
        if (message.trim()) {
            const newMessage: Message = {
                id: messages.length + 1,
                text: message,
                sender: 'user',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            
            setMessages([...messages, newMessage]);
            
            // Dispatch to Redux if needed
            dispatch(createNotice({
                firstName: 'Contract',
                lastName: 'Client',
                title: 'Contract Notice',
                message: message,
                email: '',
                phone: ''
            }));
            
            setMessage('');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="flex flex-col h-screen bg-background">
            {/* Chat Header */}
            <div className="border-b bg-card px-4 py-3 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src="/avatar.png" />
                        <AvatarFallback className="bg-primary text-primary-foreground">CN</AvatarFallback>
                    </Avatar>
                    <div>
                        <h2 className="font-semibold text-sm">Contract Notices</h2>
                        <p className="text-xs text-muted-foreground">Online</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <Video className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <Phone className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <Search className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <MoreVertical className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className="flex items-end gap-2 max-w-[70%]">
                            {msg.sender === 'client' && (
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback className="bg-muted text-xs">CL</AvatarFallback>
                                </Avatar>
                            )}
                            <div>
                                <Card
                                    className={`px-4 py-2 ${
                                        msg.sender === 'user'
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-card'
                                    }`}
                                >
                                    <p className="text-sm break-words">{msg.text}</p>
                                </Card>
                                <p className={`text-xs text-muted-foreground mt-1 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                                    {msg.timestamp}
                                </p>
                            </div>
                            {msg.sender === 'user' && (
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">ME</AvatarFallback>
                                </Avatar>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Message Input Area */}
            <div className="border-t bg-card p-4">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <Smile className="h-5 w-5 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <Paperclip className="h-5 w-5 text-muted-foreground" />
                    </Button>
                    <Input
                        placeholder="Type a message..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="flex-1 rounded-full"
                    />
                    <Button 
                        onClick={handleSendMessage}
                        size="icon" 
                        className="rounded-full"
                        disabled={!message.trim()}
                    >
                        <Send className="h-5 w-5" />
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default Page