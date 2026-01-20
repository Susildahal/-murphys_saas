"use client"

import { useState, useEffect, useRef } from "react"
import { useAppSelector } from "@/lib/redux/hooks"
import { getAuth } from "firebase/auth"
import {
  createChatConversation,
  sendChatMessage,
  listenToUserConversations,
  listenToMessages,
  updateConversationStatus,
  ChatConversation,
  ChatMessage,
} from "@/lib/realtimeChatService"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  MessageCircle, 
  Send, 
  Plus,
  Loader2,
  Search,
  CheckCircle2,
  Circle,
  Clock,
  ArrowLeft
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"

export default function ChatPage() {
  const [conversations, setConversations] = useState<ChatConversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [messageText, setMessageText] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  
  const [newChat, setNewChat] = useState({
    subject: "",
    message: "",
  })
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const profileState = useAppSelector((state) => state.profile)
  const profile = Array.isArray(profileState.profile) ? profileState.profile[0] : profileState.profile
  const auth = getAuth()
  
  const userEmail = profile?.email || auth.currentUser?.email || ""
  const userId = auth.currentUser?.uid || ""
  const userName = profile?.name || profile?.firstName && profile?.lastName
    ? `${profile.firstName} ${profile.lastName}`.trim()
    : "User"

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Listen to conversations
  useEffect(() => {
    if (!userEmail) return

    console.log('[DEBUG] Setting up conversation listener for:', userEmail)
    const unsubscribe = listenToUserConversations(userEmail, (convos) => {
      console.log('[DEBUG] Received conversations:', convos)
      setConversations(convos)
    })

    return () => unsubscribe()
  }, [userEmail])

  // Listen to messages in selected conversation
  useEffect(() => {
    if (!selectedConversation?.id) return

    console.log('[DEBUG] Setting up message listener for conversation:', selectedConversation.id)
    const unsubscribe = listenToMessages(selectedConversation.id, (msgs) => {
      console.log('[DEBUG] Received messages:', msgs)
      setMessages(msgs)
    })

    return () => unsubscribe()
  }, [selectedConversation?.id])

  const handleCreateChat = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newChat.subject || !newChat.message || !userEmail) return
    
    setSubmitting(true)
    try {
      const conversationId = await createChatConversation({
        userId,
        userEmail,
        userName,
        subject: newChat.subject,
        initialMessage: newChat.message,
      })
      
      toast({
        title: "Chat Started",
        description: "Your conversation has been created",
      })
      
      setNewChat({ subject: "", message: "" })
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error creating chat:", error)
      toast({
        title: "Error",
        description: "Failed to create chat",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageText.trim() || !selectedConversation?.id) return
    
    setSubmitting(true)
    try {
      await sendChatMessage(selectedConversation.id, {
        message: messageText,
        senderId: userId,
        senderName: userName,
        senderEmail: userEmail,
        isAdmin: false,
      })
      
      setMessageText("")
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500"
      case "resolved":
        return "bg-blue-500"
      case "closed":
        return "bg-gray-500"
      default:
        return "bg-gray-400"
    }
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    if (diff < 60000) return "Just now"
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    return date.toLocaleDateString()
  }

  const filteredConversations = conversations.filter(conv =>
    conv.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Conversations Sidebar */}
      <div className="w-full md:w-96 border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <MessageCircle className="w-6 h-6 text-blue-500" />
              Messages
            </h1>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="rounded-full">
                  <Plus className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Start New Conversation</DialogTitle>
                  <DialogDescription>
                    Send a message to our admin team
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleCreateChat} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      placeholder="What's this about?"
                      value={newChat.subject}
                      onChange={(e) => setNewChat({ ...newChat, subject: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Type your message..."
                      rows={6}
                      value={newChat.message}
                      onChange={(e) => setNewChat({ ...newChat, message: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={submitting}>
                      {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Start Chat
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Conversations List */}
        <ScrollArea className="flex-1">
          {filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <MessageCircle className="w-16 h-16 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">No conversations yet</p>
              <p className="text-sm text-muted-foreground">Start a new chat with admin</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv)}
                  className={`w-full p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                    selectedConversation?.id === conv.id ? "bg-blue-50 dark:bg-blue-950/20 border-l-4 border-blue-500" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white">
                          {conv.userName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 ${getStatusColor(conv.status)}`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-semibold truncate">{conv.subject}</h3>
                        <span className="text-xs text-muted-foreground ml-2">
                          {formatTime(conv.lastMessageTime)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
                      <Badge variant="secondary" className="mt-1 text-xs capitalize">
                        {conv.status}
                      </Badge>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white dark:bg-slate-900">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="md:hidden"
                  onClick={() => setSelectedConversation(null)}
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white">
                    {selectedConversation.userName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h2 className="font-semibold">{selectedConversation.subject}</h2>
                  <p className="text-sm text-muted-foreground">
                    {selectedConversation.status === "active" && "Active conversation"}
                    {selectedConversation.status === "resolved" && "Resolved"}
                    {selectedConversation.status === "closed" && "Closed"}
                  </p>
                </div>
                <Badge variant="outline" className="capitalize">
                  {selectedConversation.status}
                </Badge>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4 max-w-4xl mx-auto">
                {messages.map((msg, index) => {
                  const isOwn = msg.senderEmail === userEmail
                  const showAvatar = index === 0 || messages[index - 1].isAdmin !== msg.isAdmin
                  
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-3 ${isOwn ? "flex-row-reverse" : "flex-row"}`}
                    >
                      {showAvatar ? (
                        <Avatar className="w-8 h-8 flex-shrink-0">
                          <AvatarFallback className={msg.isAdmin ? "bg-gradient-to-br from-purple-400 to-purple-600" : "bg-gradient-to-br from-blue-400 to-blue-600"}>
                            {msg.senderName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="w-8" />
                      )}
                      
                      <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"} max-w-[70%]`}>
                        {showAvatar && (
                          <div className={`flex items-center gap-2 mb-1 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
                            <span className="text-xs font-semibold">
                              {msg.isAdmin ? `${msg.senderName} (Admin)` : msg.senderName}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatTime(msg.timestamp)}
                            </span>
                          </div>
                        )}
                        
                        <div
                          className={`rounded-2xl px-4 py-2 ${
                            isOwn
                              ? "bg-blue-500 text-white rounded-tr-sm"
                              : msg.isAdmin
                              ? "bg-purple-100 dark:bg-purple-950/30 text-purple-900 dark:text-purple-100 rounded-tl-sm"
                              : "bg-slate-100 dark:bg-slate-800 rounded-tl-sm"
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                        </div>
                        
                        {isOwn && (
                          <div className="flex items-center gap-1 mt-1">
                            {msg.read ? (
                              <CheckCircle2 className="w-3 h-3 text-blue-500" />
                            ) : (
                              <Circle className="w-3 h-3 text-muted-foreground" />
                            )}
                            <span className="text-xs text-muted-foreground">
                              {msg.read ? "Read" : "Sent"}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            {selectedConversation.status !== "closed" && (
              <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                <div className="flex gap-2 max-w-4xl mx-auto">
                  <Input
                    placeholder="Type a message..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="flex-1"
                    disabled={submitting}
                  />
                  <Button type="submit" disabled={!messageText.trim() || submitting} size="icon">
                    {submitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </form>
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <MessageCircle className="w-24 h-24 text-muted-foreground/20 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Conversation Selected</h3>
            <p className="text-muted-foreground mb-4">
              Choose a conversation from the list or start a new one
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Start New Chat
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
