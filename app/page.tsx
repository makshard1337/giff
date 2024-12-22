'use client'
import { useState, useEffect } from 'react'

const GIPHY_API_KEY = 'GlVGYHkr3WSBnllca54iNt0yFbjz7L65'

interface Message {
  type: string;
  url: string;
}

interface GiphyImage {
  fixed_height: {
    url: string;
  };
}

interface GiphyGif {
  id: string;
  title: string;
  images: GiphyImage;
}

export default function App() {
  const [inputValue, setInputValue] = useState('')
  const [gifs, setGifs] = useState<GiphyGif[]>([])
  const [showGifs, setShowGifs] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])

  useEffect(() => {
    const testSearch = async () => {
      try {
        const response = await fetch(
          `https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_API_KEY}&limit=9&rating=g`
        )
        const data = await response.json()
        console.log('Initial trending gifs:', data)
        if (data.data) {
          setGifs(data.data)
          setShowGifs(true)
        }
      } catch (error) {
        console.error('Test error:', error)
      }
    }
    testSearch()
  }, [])

  const searchGifs = async (searchTerm: string) => {
    if (!searchTerm.startsWith('/gif')) return
    
    const query = searchTerm.replace('/gif', '').trim()
    if (!query) {
      // Если запрос пустой, показываем трендовые гифки
      try {
        const response = await fetch(
          `https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_API_KEY}&limit=9&rating=g`
        )
        const data = await response.json()
        if (data.data) {
          setGifs(data.data)
          setShowGifs(true)
        }
      } catch (error) {
        console.error('Error fetching trending:', error)
      }
      return
    }
  
    try {
      console.log('Searching for:', query)
      const response = await fetch(
        `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(query)}&limit=9&rating=g`
      )
      const data = await response.json()
      console.log('GIPHY search response:', data)
      if (data.data) {
        setGifs(data.data)
        setShowGifs(true)
      }
    } catch (error) {
      console.error('Error fetching gifs:', error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)
    if (value.startsWith('/gif')) {
      searchGifs(value)
    } else {
      setShowGifs(false)
    }
  }

  const handleGifSelect = (gif: GiphyGif) => {
    setMessages([...messages, { type: 'gif', url: gif.images.fixed_height.url }])
    setShowGifs(false)
    setInputValue('')
  }

  return (
    <main className="min-h-screen bg-[#F3F3F3] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg w-[437px] h-[340px] overflow-hidden flex flex-col relative">
        <div className="bg-white flex-grow overflow-y-auto">
          <div className="h-full flex flex-col">
            <div className="flex-grow overflow-y-auto">
              <div className="flex flex-col gap-2 p-4">
                {messages.map((message, index) => (
                  <div key={index} className="w-full">
                    <img 
                      src={message.url} 
                      alt="gif" 
                      className="rounded-lg max-w-[200px]"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {showGifs && gifs.length > 0 && (
          <div className="absolute bottom-[70px] left-[16px] right-[16px] bg-white shadow-lg border h-[250px] overflow-y-auto">
            <div className="grid grid-cols-3 gap-2 p-4">
              {gifs.map((gif) => (
                <div 
                  key={gif.id} 
                  className="cursor-pointer hover:opacity-80" 
                  onClick={() => handleGifSelect(gif)}
                >
                  <img
                    src={gif.images.fixed_height.url}
                    alt={gif.title}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="p-4 border-t">
          <div className="relative">
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder="Напишите сообщение"
              className="w-full p-2 border rounded-lg focus:outline-none focus:border-blue-500 text-gray-600"
              style={{ caretColor: 'black' }}
            />
            {inputValue.startsWith('/gif') && (
              <div className="absolute inset-0 p-2 pointer-events-none">
                <span className="gradient-text">/gif</span>
                <span className="text-gray-600">{inputValue.slice(4)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
