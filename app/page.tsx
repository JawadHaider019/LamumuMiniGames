"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import MemoryMatchGame from "@/components/memory-match-game"
import { Edit, Camera, X } from "lucide-react"

interface PlayerData {
  name: string
  image: string | null
  rewards: {
    grass: number
    milk: number
  }
  scores: {
    bestTime: number | null
    bestMoves: number | null
  }
}

export default function HomePage() {
  const [playerName, setPlayerName] = useState("")
  const [playerData, setPlayerData] = useState<PlayerData>({
    name: "",
    image: null,
    rewards: { grass: 0, milk: 0 },
    scores: { bestTime: null, bestMoves: null },
  })
  const [showMemoryMatch, setShowMemoryMatch] = useState(false)
  const [tempName, setTempName] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const saved = localStorage.getItem("lamumuPlayer")
    if (saved) {
      const data = JSON.parse(saved)
      setPlayerData(data)
      setPlayerName(data.name)
    }
  }, [])

  const savePlayerName = () => {
    if (tempName.trim()) {
      const newData = { ...playerData, name: tempName.trim() }
      setPlayerData(newData)
      setPlayerName(tempName.trim())
      localStorage.setItem("lamumuPlayer", JSON.stringify(newData))
      setTempName("")
      setIsEditing(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const imageDataUrl = event.target?.result as string
        const newData = { ...playerData, image: imageDataUrl }
        setPlayerData(newData)
        localStorage.setItem("lamumuPlayer", JSON.stringify(newData))
      }
      reader.readAsDataURL(file)
    }
  }

  const removeProfileImage = () => {
    const newData = { ...playerData, image: null }
    setPlayerData(newData)
    localStorage.setItem("lamumuPlayer", JSON.stringify(newData))
  }

  const handleGameComplete = (moves: number, time: number) => {
    // Calculate rewards based on performance
    const baseGrass = 10
    const baseMilk = 1

    // Bonus for fewer moves (perfect game is 8 moves)
    const moveBonus = Math.max(0, Math.floor((20 - moves) / 2))
    const grassReward = Math.min(20, baseGrass + moveBonus)

    // Bonus for faster time (under 30 seconds gets bonus)
    const timeBonus = time < 30 ? Math.floor((30 - time) / 10) : 0
    const milkReward = Math.min(5, baseMilk + timeBonus)

    const newData = {
      ...playerData,
      rewards: {
        grass: playerData.rewards.grass + grassReward,
        milk: playerData.rewards.milk + milkReward,
      },
      scores: {
        bestTime: playerData.scores.bestTime ? Math.min(playerData.scores.bestTime, time) : time,
        bestMoves: playerData.scores.bestMoves ? Math.min(playerData.scores.bestMoves, moves) : moves,
      },
    }
    setPlayerData(newData)
    localStorage.setItem("lamumuPlayer", JSON.stringify(newData))
    setShowMemoryMatch(false)
  }

  if (showMemoryMatch) {
    return (
      <MemoryMatchGame
        onComplete={handleGameComplete}
        onBack={() => setShowMemoryMatch(false)}
        playerName={playerName}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card">
      <div className="container mx-auto px-6 py-12 max-w-7xl">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-6 web3-glow">
            Lamumu Mini Games Platform
          </h1>
          <p className="text-muted-foreground text-xl font-medium">Play, Earn, Dominate the Leaderboard</p>
        </div>

        <Card className="mb-12 glass-effect border-2 border-primary/20 web3-glow">
          <CardHeader>
            <CardTitle className="text-2xl text-primary flex items-center gap-3">
             Player Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!playerName ? (
              <div className="flex gap-4">
                <Input
                  placeholder="Enter your gamer tag"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && savePlayerName()}
                  className="text-lg py-3 bg-card/50 border-primary/30 focus:border-primary"
                />
                <Button onClick={savePlayerName} className="px-8 py-3 text-lg font-semibold web3-glow">
                  Initialize
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center gap-6">
                  {/* Profile Image Section */}
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-primary/30">
                      {playerData.image ? (
                        <img 
                          src={playerData.image} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-4xl">👤</div>
                      )}
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded-full">
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                      {playerData.image && (
                        <Button
                          variant="destructive"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                          onClick={removeProfileImage}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>

                  {/* Name Section */}
                  <div className="flex-1">
                    {isEditing ? (
                      <div className="flex gap-2 items-center">
                        <Input
                          value={tempName}
                          onChange={(e) => setTempName(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && savePlayerName()}
                          className="text-xl font-bold"
                          autoFocus
                        />
                        <Button onClick={savePlayerName} size="sm">
                          Save
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setIsEditing(false)
                            setTempName(playerName)
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <h3 className="text-2xl font-bold text-primary">Welcome, {playerName}!</h3>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setTempName(playerName)
                            setIsEditing(true)
                          }}
                          className="h-8 w-8"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="glass-effect p-6 rounded-xl border border-accent/30 reward-glow">
                    <div className="text-center">
                      <div className="text-4xl mb-2">🌱</div>
                      <div className="text-3xl font-bold text-accent">{playerData.rewards.grass}</div>
                      <div className="text-accent/80 font-medium">Grass Tokens</div>
                    </div>
                  </div>
                  <div className="glass-effect p-6 rounded-xl border border-secondary/30 reward-glow">
                    <div className="text-center">
                      <div className="text-4xl mb-2">🥛</div>
                      <div className="text-3xl font-bold text-secondary">{playerData.rewards.milk}</div>
                      <div className="text-secondary/80 font-medium">Milk Tokens</div>
                    </div>
                  </div>
                </div>

                {/* {(playerData.scores.bestTime || playerData.scores.bestMoves) && (
                  <div className="glass-effect p-6 rounded-xl border border-primary/30">
                    <h4 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                      <span className="text-2xl">🏆</span>
                      Personal Best Records
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">
                          {playerData.scores.bestTime ? `${playerData.scores.bestTime}s` : "N/A"}
                        </div>
                        <div className="text-muted-foreground">Best Time</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{playerData.scores.bestMoves || "N/A"}</div>
                        <div className="text-muted-foreground">Best Moves</div>
                      </div>
                    </div>
                  </div>
                )} */}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Memory Match Game */}
          <Card className="group hover:scale-105 transition-all duration-300 glass-effect border-2 border-primary/30 hover:border-primary/60 web3-glow cursor-pointer h-80">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl text-primary flex items-center gap-3">
                <span className="text-4xl group-hover:scale-110 transition-transform">🧠</span>
               Moo Memory Match 🐮
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col justify-between h-full">
              <div>
                <p className="text-muted-foreground text-lg mb-4">
                  Test your memory and earn rewards! Match pairs to collect Grass and Milk tokens.
                </p>
                <div className="flex gap-2 mb-6">
                  <Badge variant="outline" className="border-accent/50 text-accent">
                    🌱 10-20 Grass
                  </Badge>
                  <Badge variant="outline" className="border-secondary/50 text-secondary">
                    🥛 1-5 Milk
                  </Badge>
                </div>
              </div>
              <Button
                className="w-full py-4 text-lg font-bold web3-glow"
                onClick={() => setShowMemoryMatch(true)}
                disabled={!playerName}
              >
                {!playerName ? "Initialize Profile First" : "Launch Game"}
              </Button>
            </CardContent>
          </Card>

          {Array.from({ length: 5 }).map((_, index) => (
            <Card key={index} className="glass-effect border border-muted/30 opacity-60 h-80">
              <CardContent className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="text-6xl mb-4 opacity-50">🎮</div>
                  <div className="text-2xl font-bold text-muted-foreground">Coming Soon</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}