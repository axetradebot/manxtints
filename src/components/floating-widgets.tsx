"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Phone, MessageCircle, X, Send, ArrowRight, Bot, User } from "lucide-react"

interface Message {
  id: number
  text: string
  sender: "bot" | "user"
  timestamp: Date
}

const PHONE_NUMBER = "+447624331401"

const knowledgeBase = [
  {
    keywords: ["hello", "hi", "hey", "good morning", "good afternoon", "good evening", "howdy", "hiya"],
    response: "Hello! Welcome to ManxTints 👋 I'm here to help with any questions about our window tinting services. What can I help you with today?",
  },
  {
    keywords: ["price", "cost", "how much", "pricing", "expensive", "cheap", "afford", "quote", "estimate"],
    response: "Our pricing varies by service:\n\n🏠 Residential: From £89/m²\n🏢 Commercial: From £98/m²\n🛡️ Security Film: From £89/m²\n\nWe offer free, no-obligation quotes! Would you like to request one?",
  },
  {
    // Automotive enquiries — temporarily redirect customers since we've paused the service.
    keywords: ["car", "vehicle", "automotive", "auto", "van", "truck", "suv"],
    response: "Sorry — we've temporarily paused our automotive tinting service. We may bring it back in the future! In the meantime, we'd love to help with residential or commercial window tinting. Would you like to know more?",
  },
  {
    keywords: ["home", "house", "residential", "window", "flat", "apartment"],
    response: "Our residential tinting services include:\n\n• Solar Control Film — £89/m² (heat rejection)\n• Privacy Film — £89/m² (one-way mirror effect)\n• Decorative Film — £89/m² (frosted & patterned)\n\nBenefits: Blocks 99% UV rays, reduces energy costs, enhances privacy, and protects furniture from fading.",
  },
  {
    keywords: ["commercial", "business", "office", "shop", "store", "workplace"],
    response: "Commercial tinting solutions:\n\n• Privacy Film — £98/m²\n• UV Blocking Film — £119/m²\n• Security Film — £119/m²\n\nPerfect for GDPR-compliant privacy, reducing glare on screens, energy savings, and giving your storefront a professional look.",
  },
  {
    keywords: ["security", "safety", "protect", "break-in", "bomb", "blast"],
    response: "We offer specialty security films:\n\n• Security Film — £89/m² (break-in protection)\n• Energy Saving Film — £90/m² (27% heat loss reduction)\n• Anti-Fog Film — £200/m²\n• Data Jammer Film — £900/m² (screens black from outside)\n• Bomb Blast Protection — £100/m²\n\nIdeal for homes, businesses, and high-security environments.",
  },
  {
    keywords: ["uv", "sun", "protect", "fade", "skin", "health", "cancer"],
    response: "All our window films block up to 99% of harmful UV rays! This protects your skin from sun damage, prevents furniture and interiors from fading, and helps maintain comfortable temperatures. It's like sunscreen for your windows!",
  },
  {
    keywords: ["privacy", "see through", "mirror", "one way", "visible", "night"],
    response: "Our privacy films use dual ceramic technology. They create a reflective exterior layer for daytime privacy while maintaining a non-reflective interior, so you can see out clearly both day and night. Unlike inferior brands, the privacy effect doesn't reverse at night!",
  },
  {
    keywords: ["legal", "law", "regulation", "allowed", "permit"],
    response: "Yes, window tinting is fully legal on the Isle of Man for residential and commercial properties! We ensure all installations comply with IOM regulations.",
  },
  {
    keywords: ["long", "time", "duration", "take", "how long", "wait"],
    response: "Installation times vary:\n\n🏠 Residential: Depends on number/size of windows\n🏢 Commercial: Varies by project scope\n\nWe'll give you an accurate time estimate with your quote. We also recommend waiting 3-5 days before cleaning newly tinted windows.",
  },
  {
    keywords: ["guarantee", "warranty", "last", "lifespan", "durability"],
    response: "Our premium films last 15-25 years with proper care. We offer:\n\n• Standard guarantee: 5 years (included)\n• Extended guarantee: 10 years (just +£19)\n\nWe only use trusted, premium brands that won't fade or bubble.",
  },
  {
    keywords: ["payment", "pay", "finance", "installment", "credit"],
    response: "Get an automatic 10% off when you use our online DIY Calculator! Need a flexible payment plan? Just message us and we'll work something out — making quality tinting affordable for everyone on the island.",
  },
  {
    keywords: ["area", "cover", "location", "where", "travel", "mobile", "come to"],
    response: "We cover the entire Isle of Man! Whether you're in Douglas, Ramsey, Peel, Castletown, or anywhere else on the island, we can come to you for residential and commercial installations.",
  },
  {
    keywords: ["contact", "phone", "call", "email", "reach", "address", "hours"],
    response: "You can reach us:\n\n📞 Phone: +44 7624 331401\n📧 Email: manxtints@gmail.com\n📍 Location: Douglas, Isle of Man (IM2 1BB)\n⏰ Hours: 9am-5pm, 7 days a week\n\nOr use the phone button to call us directly!",
  },
  {
    keywords: ["book", "appointment", "schedule", "consultation", "visit"],
    response: "Booking is easy! You can:\n\n1. Request a free home visit through our quote page\n2. Use our DIY Calculator for an instant 10% off quote\n3. Call us at +44 7624 331401\n4. Email manxtints@gmail.com\n\nWe offer free, no-obligation consultations and quotes!",
  },
  {
    keywords: ["remove", "take off", "undo", "peel"],
    response: "Yes, our window tinting films can be safely removed free of charge! We use professional techniques to ensure a clean, residue-free removal process.",
  },
  {
    keywords: ["wash", "clean", "maintain", "care"],
    response: "After tinting, wait 3-5 days for the film to fully cure. After that, use a soft cloth and ammonia-free cleaning products. Avoid abrasive materials that could scratch the film. Simple care for long-lasting results!",
  },
  // PPF (vehicle paint protection) — temporarily disabled along with Automotive service.
  // {
  //   keywords: ["ppf", "paint protection", "paint film", "stone chip", "scratch"],
  //   response: "We're expanding our services to include premium Paint Protection Film (PPF) installation soon! PPF protects your vehicle's paintwork from stone chips, scratches, and environmental damage. Contact us to be notified when this service launches!",
  // },
  {
    keywords: ["dark", "darkness", "shade", "level", "light", "tint level"],
    response: "You can choose your preferred level of darkness! During the consultation, we'll guide you through all available options including different levels of darkness and shades.",
  },
  {
    keywords: ["energy", "heat", "cold", "insulation", "temperature", "saving"],
    response: "Our window films can reduce interior heat by up to 60% and lower energy costs significantly. Energy Saving Film reduces winter heat loss by 27%! It's an investment that pays for itself through reduced heating and cooling bills.",
  },
  {
    keywords: ["why", "choose", "different", "special", "best", "better"],
    response: "Why choose ManxTints?\n\n⭐ Professional & friendly staff\n💰 Competitive, transparent pricing\n📅 Hassle-free booking process\n✅ Satisfaction guaranteed\n🇮🇲 Island-wide service, 7 days a week\n🏆 IOM Government contractor\n🛡️ Extended guarantee up to 10 years (+£19)\n\nWe use only premium materials and stand behind every installation!",
  },
  {
    keywords: ["thank", "thanks", "cheers", "appreciate", "great", "helpful"],
    response: "You're welcome! Happy to help 😊 If you have any more questions, feel free to ask. You can also call us at +44 7624 331401 or request a free quote through our website. Have a great day!",
  },
  {
    keywords: ["service", "what do you", "offer", "do you do", "services"],
    response: "We offer a wide range of window tinting services:\n\n🏠 Residential Tinting — Comfort, efficiency & privacy\n🏢 Commercial Tinting — Professional, efficient & secure\n🛡️ Specialty Films — Security, energy saving, anti-fog, data jammer, bomb blast protection\n\nWhat would you like to know more about?",
  },
  {
    keywords: ["glare", "screen", "computer", "monitor"],
    response: "Our window tinting significantly reduces glare — perfect for homes with TV rooms or offices with computer screens. No more squinting or repositioning screens! Our commercial films are specifically designed to reduce computer screen glare.",
  },
  {
    keywords: ["fog", "condensation", "mist", "moisture"],
    response: "We offer Anti-Fog Film at £200/m² that prevents condensation and fogging on your windows. Perfect for kitchens, bathrooms, or any environment prone to moisture buildup.",
  },
  {
    keywords: ["data", "jammer", "spy", "espionage", "confidential"],
    response: "Our Data Jammer Film (£900/m²) makes screens completely black when viewed from outside, protecting sensitive data from visual espionage. Perfect for government offices, financial institutions, or any business handling confidential information.",
  },
]

function findResponse(input: string): string {
  const lowerInput = input.toLowerCase()

  for (const entry of knowledgeBase) {
    for (const keyword of entry.keywords) {
      if (lowerInput.includes(keyword)) {
        return entry.response
      }
    }
  }

  return "I'd be happy to help with that! For specific questions, you can:\n\n📞 Call us: +44 7624 331401\n📧 Email: manxtints@gmail.com\n\nOr ask me about our services, pricing, guarantees, coverage areas, or anything else about window tinting!"
}

const quickReplies = [
  "What services do you offer?",
  "How much does it cost?",
  "Do you cover my area?",
  "How do I book?",
]

export function FloatingWidgets() {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hi there! 👋 I'm the ManxTints assistant. Ask me anything about our window tinting services, pricing, or booking!",
      sender: "bot",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  useEffect(() => {
    if (isChatOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isChatOpen])

  const handleSend = useCallback(() => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now(),
      text: inputValue.trim(),
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const query = inputValue.trim()
    setInputValue("")
    setIsTyping(true)

    setTimeout(() => {
      const botResponse: Message = {
        id: Date.now() + 1,
        text: findResponse(query),
        sender: "bot",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botResponse])
      setIsTyping(false)
    }, 600 + Math.random() * 800)
  }, [inputValue])

  const handleQuickReply = useCallback((reply: string) => {
    const userMessage: Message = {
      id: Date.now(),
      text: reply,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setIsTyping(true)

    setTimeout(() => {
      const botResponse: Message = {
        id: Date.now() + 1,
        text: findResponse(reply),
        sender: "bot",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botResponse])
      setIsTyping(false)
    }, 600 + Math.random() * 800)
  }, [])

  return (
    <>
      {/* Phone Button - Bottom Left */}
      <motion.a
        href={`tel:${PHONE_NUMBER}`}
        className="fixed bottom-6 left-6 z-50 hidden sm:flex"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 200, damping: 15 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Call ManxTints"
      >
        <div className="relative group">
          <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-25" />
          <div className="absolute inset-0 bg-blue-400/30 rounded-full animate-pulse scale-125" />
          <div className="relative w-14 h-14 bg-gradient-to-br from-blue-600 to-sky-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30 transition-shadow duration-300 group-hover:shadow-xl group-hover:shadow-blue-500/40">
            <Phone className="h-6 w-6 text-white" />
          </div>
          <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-white rounded-lg px-3 py-1.5 shadow-lg border border-slate-200 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
            <span className="text-sm font-medium text-slate-700">Call us now</span>
          </div>
        </div>
      </motion.a>

      {/* Mobile Bottom Bar - Get Free Quote + Phone */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 z-50 sm:hidden"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8, type: "spring", stiffness: 200, damping: 20 }}
      >
        <div className="bg-white/95 backdrop-blur-xl border-t border-slate-200 px-4 py-3 flex gap-3 items-center shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
          <a
            href={`tel:${PHONE_NUMBER}`}
            className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-600 to-sky-500 rounded-xl shadow-md shadow-blue-500/20 shrink-0"
            aria-label="Call ManxTints"
          >
            <Phone className="h-5 w-5 text-white" />
          </a>
          <Link href="/quote" className="flex-1">
            <div className="bg-gradient-to-r from-blue-600 to-sky-500 text-white rounded-xl py-3 px-5 text-center font-semibold text-sm shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform">
              Get Free Quote
              <ArrowRight className="h-4 w-4" />
            </div>
          </Link>
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-600 to-sky-500 rounded-xl shadow-md shadow-blue-500/20 shrink-0"
            aria-label="Open chat"
          >
            {isChatOpen ? (
              <X className="h-5 w-5 text-white" />
            ) : (
              <MessageCircle className="h-5 w-5 text-white" />
            )}
          </button>
        </div>
      </motion.div>

      {/* Chat Toggle Button - Desktop (Bottom Right) */}
      <motion.button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-6 right-6 z-50 hidden sm:flex"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.2, type: "spring", stiffness: 200, damping: 15 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label={isChatOpen ? "Close chat" : "Open chat"}
      >
        <div className="relative group">
          {!isChatOpen && (
            <>
              <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-20" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white z-10" />
            </>
          )}
          <div className="relative w-14 h-14 bg-gradient-to-br from-blue-600 to-sky-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-blue-500/40">
            <AnimatePresence mode="wait">
              {isChatOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="h-6 w-6 text-white" />
                </motion.div>
              ) : (
                <motion.div
                  key="chat"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <MessageCircle className="h-6 w-6 text-white" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            className="fixed z-50 sm:bottom-24 sm:right-6 bottom-[76px] left-0 right-0 sm:left-auto sm:w-[380px] sm:max-h-[520px] max-h-[70vh] flex flex-col bg-white sm:rounded-2xl rounded-t-2xl shadow-2xl border border-slate-200 overflow-hidden"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-blue-600 to-sky-500 px-5 py-4 flex items-center gap-3 shrink-0">
              <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold text-sm">ManxTints Assistant</h3>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                  <span className="text-blue-100 text-xs">Online now</span>
                </div>
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors sm:hidden"
                aria-label="Close chat"
              >
                <X className="h-4 w-4 text-white" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 bg-slate-50/50">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex gap-2.5 ${message.sender === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    message.sender === "bot"
                      ? "bg-gradient-to-br from-blue-600 to-sky-500"
                      : "bg-slate-200"
                  }`}>
                    {message.sender === "bot" ? (
                      <Bot className="h-3.5 w-3.5 text-white" />
                    ) : (
                      <User className="h-3.5 w-3.5 text-slate-600" />
                    )}
                  </div>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    message.sender === "bot"
                      ? "bg-white text-slate-700 shadow-sm border border-slate-100 rounded-tl-sm"
                      : "bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-tr-sm"
                  }`}>
                    {message.text.split("\n").map((line, i) => (
                      <span key={i}>
                        {line}
                        {i < message.text.split("\n").length - 1 && <br />}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-2.5"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-sky-500 flex items-center justify-center shrink-0">
                    <Bot className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-slate-100">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:0ms]" />
                      <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:150ms]" />
                      <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies */}
            {messages.length <= 2 && (
              <div className="px-4 py-2 border-t border-slate-100 bg-white shrink-0">
                <div className="flex flex-wrap gap-2">
                  {quickReplies.map((reply) => (
                    <button
                      key={reply}
                      onClick={() => handleQuickReply(reply)}
                      className="text-xs bg-blue-50 text-blue-600 border border-blue-200 rounded-full px-3 py-1.5 hover:bg-blue-100 transition-colors whitespace-nowrap"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="px-4 py-3 border-t border-slate-200 bg-white shrink-0">
              <div className="flex gap-2 items-center">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSend()
                    }
                  }}
                  placeholder="Ask me anything..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all placeholder:text-slate-400"
                />
                <button
                  onClick={handleSend}
                  disabled={!inputValue.trim()}
                  className="w-10 h-10 bg-gradient-to-r from-blue-600 to-sky-500 rounded-xl flex items-center justify-center text-white shrink-0 disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-md hover:shadow-blue-500/20 transition-all active:scale-95"
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
