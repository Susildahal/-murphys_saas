"use client"

import { useState, useEffect, useRef } from "react"
import { useAppSelector } from "@/lib/redux/hooks"
import { getAuth } from "firebase/auth"
import {
  sendChatMessage,
  listenToAllConversations,
  listenToMessages,
  updateConversationStatus,
  searchConversationsByEmail,
  ChatConversation,
  ChatMessage,
} from "@/lib/realtimeChatService"
import { Button } from "@/components/ui/button"

import { Input } from "@/components/ui/input"

import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  MessageCircle, 
  Send,
  Loader2,
  Search,
  CheckCircle2,
  Circle,
  Shield,
  Users,
  Activity,
  XCircle,
  ArrowLeft
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

export default function AdminChatPage() {
  const [conversations, setConversations] = useState<ChatConversation[]>([])
  const [filteredConversations, setFilteredConversations] = useState<ChatConversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [messageText, setMessageText] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [statusFilter, setStatusFilter] = useState<ChatConversation["status"] | "all">("all")
  const [searchEmail, setSearchEmail] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const profileState = useAppSelector((state) => state.profile)
  const profile = Array.isArray(profileState.profile) ? profileState.profile[0] : profileState.profile
  const auth = getAuth()
  
  const adminEmail = profile?.email || auth.currentUser?.email || ""
  const adminName = profile?.name || profile?.firstName && profile?.lastName
    ? `${profile.firstName} ${profile.lastName}`.trim()
    : "Admin"

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Listen to all conversations
  useEffect(() => {
    console.log('[DEBUG] Setting up admin conversation listener, filter:', statusFilter)
    const unsubscribe = listenToAllConversations(
      (convos) => {
        console.log('[DEBUG] Admin received conversations:', convos)
        setConversations(convos)
        applyFilters(convos)
      },
      statusFilter === "all" ? undefined : statusFilter
    )

    return () => unsubscribe()
  }, [statusFilter])

  // Listen to messages in selected conversation
  useEffect(() => {
    if (!selectedConversation?.id) return

    console.log('[DEBUG] Admin setting up message listener for conversation:', selectedConversation.id)
    const unsubscribe = listenToMessages(selectedConversation.id, (msgs) => {
      console.log('[DEBUG] Admin received messages:', msgs)
      setMessages(msgs)
    })

    return () => unsubscribe()
  }, [selectedConversation?.id])

  const applyFilters = (convos: ChatConversation[]) => {
    let filtered = convos

    if (searchQuery) {
      filtered = filtered.filter(conv =>
        conv.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredConversations(filtered)
  }

  useEffect(() => {
    applyFilters(conversations)
  }, [searchQuery, conversations])

  const handleSearchEmail = async () => {
    if (!searchEmail.trim()) {
      return
    }
    
    try {
      const results = await searchConversationsByEmail(searchEmail.trim())
      setFilteredConversations(results)
    } catch (error) {
      console.error("Error searching:", error)
      toast({
        title: "Error",
        description: "Failed to search conversations",
        variant: "destructive",
      })
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageText.trim() || !selectedConversation?.id) return
    
    setSubmitting(true)
    try {
      await sendChatMessage(selectedConversation.id, {
        message: messageText,
        senderId: auth.currentUser?.uid || "",
        senderName: adminName,
        senderEmail: adminEmail,
        isAdmin: true,
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

  const handleUpdateStatus = async (newStatus: ChatConversation["status"]) => {
    if (!selectedConversation?.id) return
    
    try {
      await updateConversationStatus(selectedConversation.id, newStatus)
      toast({
        title: "Status Updated",
        description: `Conversation marked as ${newStatus}`,
      })
    } catch (error) {
      console.error("Error updating status:", error)
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      })
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

  const stats = {
    total: conversations.length,
    active: conversations.filter(c => c.status === "active").length,
    resolved: conversations.filter(c => c.status === "resolved").length,
    closed: conversations.filter(c => c.status === "closed").length,
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gradient-to-br from-purple-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      {/* Conversations Sidebar */}
      <div className="w-full md:w-96 border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="mb-4">
            <h1 className="text-2xl font-bold flex items-center gap-2 mb-2">
              <Shield className="w-6 h-6 text-purple-500" />
              Admin Chat
            </h1>
            
            {/* Stats */}
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-2">
                <div className="text-xs text-muted-foreground">Total</div>
                <div className="text-lg font-bold">{stats.total}</div>
              </div>
              <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-2">
                <div className="text-xs text-green-600 dark:text-green-400">Active</div>
                <div className="text-lg font-bold text-green-600 dark:text-green-400">{stats.active}</div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-2">
                <div className="text-xs text-blue-600 dark:text-blue-400">Resolved</div>
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{stats.resolved}</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-950/20 rounded-lg p-2">
                <div className="text-xs text-gray-600 dark:text-gray-400">Closed</div>
                <div className="text-lg font-bold text-gray-600 dark:text-gray-400">{stats.closed}</div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Input
                placeholder="Search by email..."
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchEmail()}
              />
              <Button onClick={handleSearchEmail} size="icon" variant="outline">
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Conversations List */}
        <ScrollArea className="flex-1">
          {filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <Users className="w-16 h-16 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">No conversations found</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv)}
                  className={`w-full p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                    selectedConversation?.id === conv.id ? "bg-purple-50 dark:bg-purple-950/20 border-l-4 border-purple-500" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-600 text-white">
                          {conv.userName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 ${getStatusColor(conv.status)}`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <div>
                          <h3 className="font-semibold truncate">{conv.subject}</h3>
                          <p className="text-xs text-muted-foreground truncate">{conv.userEmail}</p>
                        </div>
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
                  <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-600 text-white">
                    {selectedConversation.userName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h2 className="font-semibold">{selectedConversation.subject}</h2>
                  <p className="text-sm text-muted-foreground">{selectedConversation.userEmail}</p>
                </div>
                
                <Select
                  value={selectedConversation.status}
                  onValueChange={(value: ChatConversation["status"]) => handleUpdateStatus(value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">
                      <div className="flex items-center gap-2">
                        <Activity className="w-3 h-3" />
                        Active
                      </div>
                    </SelectItem>
                    <SelectItem value="resolved">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3 h-3" />
                        Resolved
                      </div>
                    </SelectItem>
                    <SelectItem value="closed">
                      <div className="flex items-center gap-2">
                        <XCircle className="w-3 h-3" />
                        Closed
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4 max-w-4xl mx-auto">
                {messages.map((msg, index) => {
                  const isAdmin = msg.isAdmin
                  const showAvatar = index === 0 || messages[index - 1].isAdmin !== msg.isAdmin
                  
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-3 ${isAdmin ? "flex-row-reverse" : "flex-row"}`}
                    >
                      {showAvatar ? (
                        <Avatar className="w-8 h-8 flex-shrink-0">
                          <AvatarFallback className={isAdmin ? "bg-gradient-to-br from-purple-400 to-purple-600" : "bg-gradient-to-br from-indigo-400 to-blue-600"}>
                            {msg.senderName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="w-8" />
                      )}
                      
                      <div className={`flex flex-col ${isAdmin ? "items-end" : "items-start"} max-w-[70%]`}>
                        {showAvatar && (
                          <div className={`flex items-center gap-2 mb-1 ${isAdmin ? "flex-row-reverse" : "flex-row"}`}>
                            <span className="text-xs font-semibold">
                              {msg.isAdmin ? (
                                <span className="flex items-center gap-1">
                                  <Shield className="w-3 h-3" />
                                  {msg.senderName}
                                </span>
                              ) : (
                                msg.senderName
                              )}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatTime(msg.timestamp)}
                            </span>
                          </div>
                        )}
                        
                        <div
                          className={`rounded-2xl px-4 py-2 ${
                            isAdmin
                              ? "bg-purple-500 text-white rounded-tr-sm"
                              : "bg-slate-100 dark:bg-slate-800 rounded-tl-sm"
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                        </div>
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
                    placeholder="Type your admin response..."
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
            <p className="text-muted-foreground">
              Select a conversation from the list to view and respond
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
