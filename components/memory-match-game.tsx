"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"

interface MemoryMatchGameProps {
  onComplete: (moves: number, time: number) => void
  onBack: () => void
  playerName: string
}

interface GameCard {
  id: number
  symbol: string
  image: string
  isFlipped: boolean
  isMatched: boolean
}

// Updated to include image paths
const CARD_DATA = [
  { symbol: "img1",image: "img1.png" },
  { symbol: "img2", image: "img2.png" },
  { symbol: "img3", image: "img3.png" },
  { symbol: "img4", image: "img4.png" },
  { symbol: "img5", image: "img5.png" },
  { symbol: "img6", image: "img6.png" },
  { symbol: "img7", image: "img7.png" },
  { symbol: "img8", image: "img8.png" },
  { symbol: "img9", image: "img9.png" },
]

export default function MemoryMatchGame({ onComplete, onBack, playerName }: MemoryMatchGameProps) {
  const [cards, setCards] = useState<GameCard[]>([])
  const [flippedCards, setFlippedCards] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [startTime, setStartTime] = useState<number>(0)
  const [gameTime, setGameTime] = useState(0)
  const [isGameComplete, setIsGameComplete] = useState(false)
  const [showReward, setShowReward] = useState(false)
  const [earnedRewards, setEarnedRewards] = useState({ grass: 0, milk: 0 })

  useEffect(() => {
    initializeGame()
  }, [])

  useEffect(() => {
    if (startTime && !isGameComplete) {
      const timer = setInterval(() => {
        setGameTime(Math.floor((Date.now() - startTime) / 1000))
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [startTime, isGameComplete])

  const initializeGame = () => {
    const gameCards: GameCard[] = []
    CARD_DATA.forEach((data, index) => {
      gameCards.push(
        { id: index * 2, symbol: data.symbol, image: data.image, isFlipped: false, isMatched: false },
        { id: index * 2 + 1, symbol: data.symbol, image: data.image, isFlipped: false, isMatched: false },
      )
    })

    for (let i = gameCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[gameCards[i], gameCards[j]] = [gameCards[j], gameCards[i]]
    }

    setCards(gameCards)
    setFlippedCards([])
    setMoves(0)
    setGameTime(0)
    setStartTime(0)
    setIsGameComplete(false)
    setShowReward(false)
    setEarnedRewards({ grass: 0, milk: 0 })
  }

  const handleCardClick = useCallback(
    (cardId: number) => {
      if (!startTime) {
        setStartTime(Date.now())
      }

      const card = cards.find((c) => c.id === cardId)
      if (!card || card.isFlipped || card.isMatched || flippedCards.length >= 2) {
        return
      }

      const newFlippedCards = [...flippedCards, cardId]
      setFlippedCards(newFlippedCards)

      setCards((prev) => prev.map((c) => (c.id === cardId ? { ...c, isFlipped: true } : c)))

      if (newFlippedCards.length === 2) {
        setMoves((prev) => prev + 1)

        const [firstId, secondId] = newFlippedCards
        const firstCard = cards.find((c) => c.id === firstId)
        const secondCard = cards.find((c) => c.id === secondId)

        if (firstCard?.symbol === secondCard?.symbol) {
          setTimeout(() => {
            setCards((prev) => prev.map((c) => (c.id === firstId || c.id === secondId ? { ...c, isMatched: true } : c)))
            setFlippedCards([])
          }, 500)
        } else {
          setTimeout(() => {
            setCards((prev) =>
              prev.map((c) => (c.id === firstId || c.id === secondId ? { ...c, isFlipped: false } : c)),
            )
            setFlippedCards([])
          }, 1000)
        }
      }
    },
    [cards, flippedCards, startTime],
  )

  useEffect(() => {
    if (cards.length > 0 && cards.every((card) => card.isMatched)) {
      setIsGameComplete(true)

      const baseGrass = 10
      const baseMilk = 1

      const moveBonus = Math.max(0, Math.floor((20 - moves) / 2))
      const grassReward = Math.min(20, baseGrass + moveBonus)

      const timeBonus = gameTime < 30 ? Math.floor((30 - gameTime) / 10) : 0
      const milkReward = Math.min(5, baseMilk + timeBonus)

      setEarnedRewards({ grass: grassReward, milk: milkReward })
      setShowReward(true)

      setTimeout(() => {
        onComplete(moves, gameTime)
      }, 3000)
    }
  }, [cards, moves, gameTime, onComplete])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card p-6">
      <div className="container mx-auto max-w-8xl">
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="outline"
            onClick={onBack}
            size="lg"
            className="border-primary/50 text-primary bg-transparent"
          >
            ← Back to Platform
          </Button>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Memory Match Arena
          </h1>
          <div className="text-right">
            <p className="text-muted-foreground">
              Player: <span className="text-primary font-semibold">{playerName}</span>
            </p>
          </div>
        </div>

        <div className="flex justify-center gap-6 mb-8">
          <div className="glass-effect px-6 py-3 rounded-xl border border-primary/30">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{moves}</div>
              <div className="text-sm text-muted-foreground">Moves</div>
            </div>
          </div>
          <div className="glass-effect px-6 py-3 rounded-xl border border-secondary/30">
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary">{gameTime}s</div>
              <div className="text-sm text-muted-foreground">Time</div>
            </div>
          </div>
        </div>

        {showReward && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
            <Card className="glass-effect border-2 border-primary/50 p-12 text-center web3-glow max-w-md">
              <CardContent>
                <h2 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-6">
                  Victory Achieved!
                </h2>
                <p className="text-xl mb-8 text-muted-foreground">Mission Complete</p>
                <div className="space-y-4 mb-8">
                  <div className="flex items-center justify-center gap-4 text-3xl reward-glow">
                    <span className="animate-bounce">🌱</span>
                    <span className="text-2xl font-bold text-accent">+{earnedRewards.grass} Grass</span>
                  </div>
                  <div className="flex items-center justify-center gap-4 text-3xl reward-glow">
                    <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>
                      🥛
                    </span>
                    <span className="text-2xl font-bold text-secondary">+{earnedRewards.milk} Milk</span>
                  </div>
                </div>
                <div className="glass-effect p-4 rounded-lg border border-muted/30">
                  <p className="text-lg font-semibold text-primary mb-2">Performance Stats</p>
                  <p className="text-muted-foreground">
                    {moves} moves in {gameTime} seconds
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-6 gap-4 max-w-4xl mx-auto mb-8 text-center">
          {cards.map((card) => (
            <Card
              key={card.id}
              className={`aspect-square cursor-pointer transition-all duration-300 hover:scale-105 border-2 ${
                card.isMatched
                  ? "glass-effect border-accent/50 web3-glow"
                  : card.isFlipped
                    ? "glass-effect border-primary/50 web3-glow"
                    : "glass-effect border-muted/30 hover:border-primary/40"
              }`}
              onClick={() => handleCardClick(card.id)}
            >
              <CardContent className="flex items-center justify-center h-full p-1 ">
                {card.isFlipped || card.isMatched ? (
                  <Image 
                    src={card.image} 
                    alt="Memory card" 
                    width={200} 
                    height={200} 
                    className="object-contain rounded-2xl"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted/30">
                    <span className="text-5xl transition-transform hover:scale-110">❓</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-center">
          <Button
            onClick={initializeGame}
            variant="outline"
            size="lg"
            className="border-secondary/50 text-secondary hover:bg-secondary/10 px-8 py-3 bg-transparent"
          >
            New Game
          </Button>
        </div>
      </div>
    </div>
  )
}